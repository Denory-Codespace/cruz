-- ==============================================================================
-- CRUZ — CORE DATABASE SCHEMA MIGRATION
-- Migration: 20260911000000_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Types & Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('PASSENGER', 'DRIVER', 'OPERATIONS', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE driver_approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE driver_operational_status AS ENUM ('OFFLINE', 'ONLINE', 'IN_TRIP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ride_request_status AS ENUM (
        'REQUESTED',
        'SEARCHING',
        'DRIVER_ASSIGNED',
        'DRIVER_ARRIVING',
        'DRIVER_AT_PICKUP',
        'TRIP_STARTED',
        'TRIP_COMPLETED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE dispatch_offer_status AS ENUM ('OFFERED', 'ACCEPTED', 'DECLINED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE wallet_transaction_type AS ENUM (
        'TRIP_EARNING',
        'PLATFORM_COMMISSION',
        'WITHDRAWAL',
        'REFUND',
        'BONUS',
        'ADJUSTMENT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. USER PROFILES
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'PASSENGER',
    full_name TEXT NOT NULL,
    phone_number TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DRIVERS
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    national_id_number TEXT UNIQUE,
    driving_license_number TEXT UNIQUE,
    approval_status driver_approval_status NOT NULL DEFAULT 'PENDING',
    status driver_operational_status NOT NULL DEFAULT 'OFFLINE',
    is_available BOOLEAN NOT NULL DEFAULT FALSE,
    current_lat NUMERIC(10, 7),
    current_lng NUMERIC(10, 7),
    last_location_updated_at TIMESTAMPTZ,
    rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    rating_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. VEHICLES
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    color TEXT NOT NULL,
    license_plate TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'STANDARD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. RIDE REQUESTS
CREATE TABLE IF NOT EXISTS public.ride_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passenger_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE RESTRICT,
    status ride_request_status NOT NULL DEFAULT 'REQUESTED',
    pickup_address TEXT NOT NULL,
    pickup_lat NUMERIC(10, 7) NOT NULL,
    pickup_lng NUMERIC(10, 7) NOT NULL,
    destination_address TEXT NOT NULL,
    destination_lat NUMERIC(10, 7) NOT NULL,
    destination_lng NUMERIC(10, 7) NOT NULL,
    estimated_distance_km NUMERIC(6, 2) NOT NULL,
    estimated_duration_mins NUMERIC(5, 1) NOT NULL,
    estimated_fare_kes INTEGER NOT NULL,
    actual_fare_kes INTEGER,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 5. TRIP EVENTS (Audit Trail)
CREATE TABLE IF NOT EXISTS public.trip_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.ride_requests(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.user_profiles(id),
    from_status ride_request_status,
    to_status ride_request_status NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. DRIVER DISPATCHES
CREATE TABLE IF NOT EXISTS public.driver_dispatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.ride_requests(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    status dispatch_offer_status NOT NULL DEFAULT 'OFFERED',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. WALLETS
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    balance_kes INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'KES',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. WALLET TRANSACTIONS (Append-Only Ledger)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
    type wallet_transaction_type NOT NULL,
    amount_kes INTEGER NOT NULL,
    reference_id TEXT,
    status payment_status NOT NULL DEFAULT 'SUCCESS',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.ride_requests(id) ON DELETE RESTRICT,
    payer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    amount_kes INTEGER NOT NULL,
    provider TEXT NOT NULL DEFAULT 'MOCK',
    provider_tx_id TEXT,
    status payment_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. RATINGS
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.ride_requests(id) ON DELETE CASCADE,
    rater_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    ratee_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status, is_available, approval_status);
CREATE INDEX IF NOT EXISTS idx_ride_requests_status ON public.ride_requests(status);
CREATE INDEX IF NOT EXISTS idx_ride_requests_passenger ON public.ride_requests(passenger_id);
CREATE INDEX IF NOT EXISTS idx_ride_requests_driver ON public.ride_requests(driver_id);
CREATE INDEX IF NOT EXISTS idx_trip_events_trip_id ON public.trip_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON public.wallet_transactions(wallet_id);
