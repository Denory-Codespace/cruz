-- ==============================================================================
-- CRUZ — DEVELOPMENT SEED DATA (Nairobi, Kenya)
-- Seed: supabase/seed/seed.sql
-- ==============================================================================

-- Test IDs
-- Passenger 1: David Kamau
-- Driver 1: Samuel Mwangi
-- Driver 2: Brian Omondi
-- Admin: Denzel (Cruz Admin)

-- Insert mock profiles (these map to Supabase auth users in live environments)
INSERT INTO public.user_profiles (id, role, full_name, phone_number, is_active)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'PASSENGER', 'David Kamau', '+254712345678', TRUE),
    ('b0000000-0000-0000-0000-000000000001', 'DRIVER', 'Samuel Mwangi', '+254722334455', TRUE),
    ('b0000000-0000-0000-0000-000000000002', 'DRIVER', 'Brian Omondi', '+254733445566', TRUE),
    ('c0000000-0000-0000-0000-000000000001', 'ADMIN', 'Denzel', '+254700000000', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert Driver details (Nairobi Westlands & Kilimani coordinates)
INSERT INTO public.drivers (id, national_id_number, driving_license_number, approval_status, status, is_available, current_lat, current_lng, rating_avg, rating_count)
VALUES
    ('b0000000-0000-0000-0000-000000000001', '12345678', 'DL-987654', 'APPROVED', 'ONLINE', TRUE, -1.2683, 36.8111, 4.92, 48),
    ('b0000000-0000-0000-0000-000000000002', '23456789', 'DL-876543', 'APPROVED', 'ONLINE', TRUE, -1.2884, 36.7831, 4.88, 35)
ON CONFLICT (id) DO NOTHING;

-- Insert Vehicles
INSERT INTO public.vehicles (id, driver_id, make, model, year, color, license_plate, category, is_active)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Toyota', 'Vitz', 2018, 'Silver', 'KDA 123X', 'STANDARD', TRUE),
    ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Mazda', 'Demio', 2019, 'Pearl White', 'KDB 456Y', 'STANDARD', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert Driver Wallets
INSERT INTO public.wallets (id, user_id, balance_kes, currency)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 3450, 'KES'),
    ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 1280, 'KES')
ON CONFLICT (user_id) DO NOTHING;
