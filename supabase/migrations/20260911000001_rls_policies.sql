-- ==============================================================================
-- CRUZ — ROW LEVEL SECURITY & CONCURRENCY FUNCTIONS
-- Migration: 20260911000001_rls_policies.sql
-- ==============================================================================

-- Enable RLS on all domain tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Helper functions to check roles
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT role IN ('ADMIN', 'SUPER_ADMIN', 'OPERATIONS') FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. USER PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin());

-- 2. DRIVERS POLICIES
CREATE POLICY "Public can view approved online driver basic details"
    ON public.drivers FOR SELECT
    USING (approval_status = 'APPROVED' OR auth.uid() = id OR public.is_admin());

CREATE POLICY "Drivers can update their own status/location"
    ON public.drivers FOR UPDATE
    USING (auth.uid() = id OR public.is_admin());

-- 3. VEHICLES POLICIES
CREATE POLICY "Anyone can view active vehicles"
    ON public.vehicles FOR SELECT
    USING (is_active = TRUE OR driver_id = auth.uid() OR public.is_admin());

CREATE POLICY "Drivers can manage their own vehicles"
    ON public.vehicles FOR ALL
    USING (driver_id = auth.uid() OR public.is_admin());

-- 4. RIDE REQUESTS POLICIES
CREATE POLICY "Passengers can view and manage their own rides"
    ON public.ride_requests FOR ALL
    USING (passenger_id = auth.uid() OR driver_id = auth.uid() OR public.is_admin());

-- 5. TRIP EVENTS POLICIES
CREATE POLICY "Participants can view trip events"
    ON public.trip_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ride_requests r
            WHERE r.id = trip_events.trip_id
            AND (r.passenger_id = auth.uid() OR r.driver_id = auth.uid())
        ) OR public.is_admin()
    );

-- 6. WALLETS & TRANSACTIONS POLICIES
CREATE POLICY "Users can view their own wallet"
    ON public.wallets FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can view their own wallet transactions"
    ON public.wallet_transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.wallets w
            WHERE w.id = wallet_transactions.wallet_id
            AND w.user_id = auth.uid()
        ) OR public.is_admin()
    );

-- 7. RATINGS POLICIES
CREATE POLICY "Participants can view and submit ratings"
    ON public.ratings FOR ALL
    USING (rater_id = auth.uid() OR ratee_id = auth.uid() OR public.is_admin());

-- ==============================================================================
-- CONCURRENCY-SAFE ACCEPT DISPATCH TRANSACTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.accept_driver_dispatch(
    p_dispatch_id UUID,
    p_driver_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_trip_id UUID;
    v_trip_status ride_request_status;
    v_passenger_id UUID;
BEGIN
    -- Verify dispatch belongs to driver and is OFFERED
    SELECT trip_id INTO v_trip_id
    FROM public.driver_dispatches
    WHERE id = p_dispatch_id AND driver_id = p_driver_id AND status = 'OFFERED';

    IF v_trip_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_OR_EXPIRED_DISPATCH');
    END IF;

    -- Lock trip row FOR UPDATE to prevent race conditions
    SELECT status, passenger_id INTO v_trip_status, v_passenger_id
    FROM public.ride_requests
    WHERE id = v_trip_id
    FOR UPDATE;

    IF v_trip_status NOT IN ('REQUESTED', 'SEARCHING') THEN
        -- Mark this offer expired as someone else took it or ride cancelled
        UPDATE public.driver_dispatches SET status = 'EXPIRED' WHERE id = p_dispatch_id;
        RETURN jsonb_build_object('success', false, 'error', 'TRIP_ALREADY_ASSIGNED');
    END IF;

    -- Assign driver to trip
    UPDATE public.ride_requests
    SET driver_id = p_driver_id,
        status = 'DRIVER_ASSIGNED'
    WHERE id = v_trip_id;

    -- Mark dispatch accepted
    UPDATE public.driver_dispatches
    SET status = 'ACCEPTED'
    WHERE id = p_dispatch_id;

    -- Expire any other open dispatches for this trip
    UPDATE public.driver_dispatches
    SET status = 'EXPIRED'
    WHERE trip_id = v_trip_id AND id != p_dispatch_id AND status = 'OFFERED';

    -- Update driver status
    UPDATE public.drivers
    SET status = 'IN_TRIP', is_available = FALSE
    WHERE id = p_driver_id;

    -- Record state event
    INSERT INTO public.trip_events (trip_id, actor_id, from_status, to_status, metadata)
    VALUES (v_trip_id, p_driver_id, v_trip_status, 'DRIVER_ASSIGNED', jsonb_build_object('driver_id', p_driver_id));

    RETURN jsonb_build_object('success', true, 'trip_id', v_trip_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
