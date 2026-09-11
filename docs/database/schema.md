# Cruz — Database Schema

## PostgreSQL Tables & Entities

### 1. `user_profiles`
Extends Supabase `auth.users` with Cruz domain roles and profile metadata:
- `id` (UUID, PK, FK to `auth.users.id`)
- `role` (TEXT: `'PASSENGER'`, `'DRIVER'`, `'OPERATIONS'`, `'ADMIN'`, `'SUPER_ADMIN'`)
- `full_name` (TEXT)
- `phone_number` (TEXT)
- `avatar_url` (TEXT, optional)
- `is_active` (BOOLEAN, default `true`)
- `created_at` / `updated_at` (TIMESTAMPTZ)

### 2. `drivers`
Specific operational record for drivers:
- `id` (UUID, PK, FK to `user_profiles.id`)
- `national_id_number` (TEXT, unique)
- `driving_license_number` (TEXT, unique)
- `approval_status` (`'PENDING'`, `'APPROVED'`, `'REJECTED'`, `'SUSPENDED'`)
- `status` (`'OFFLINE'`, `'ONLINE'`, `'IN_TRIP'`)
- `is_available` (BOOLEAN, default `false`)
- `current_lat` (NUMERIC)
- `current_lng` (NUMERIC)
- `last_location_updated_at` (TIMESTAMPTZ)
- `rating_avg` (NUMERIC, default `5.00`)
- `rating_count` (INTEGER, default `0`)

### 3. `vehicles`
Vehicle associated with an approved driver:
- `id` (UUID, PK)
- `driver_id` (UUID, FK to `drivers.id`)
- `make` (TEXT, e.g. 'Toyota')
- `model` (TEXT, e.g. 'Vitz')
- `year` (INTEGER)
- `color` (TEXT)
- `license_plate` (TEXT, unique)
- `category` (TEXT: `'STANDARD'`, `'COMFORT'`, `'XL'`)
- `is_active` (BOOLEAN, default `true`)

### 4. `ride_requests`
Primary lifecycle entity for trips:
- `id` (UUID, PK)
- `passenger_id` (UUID, FK to `user_profiles.id`)
- `driver_id` (UUID, FK to `drivers.id`, nullable)
- `status` (TEXT: `'REQUESTED'`, `'SEARCHING'`, `'DRIVER_ASSIGNED'`, `'DRIVER_ARRIVING'`, `'DRIVER_AT_PICKUP'`, `'TRIP_STARTED'`, `'TRIP_COMPLETED'`, `'CANCELLED'`)
- `pickup_address` (TEXT)
- `pickup_lat` (NUMERIC)
- `pickup_lng` (NUMERIC)
- `destination_address` (TEXT)
- `destination_lat` (NUMERIC)
- `destination_lng` (NUMERIC)
- `estimated_distance_km` (NUMERIC)
- `estimated_duration_mins` (NUMERIC)
- `estimated_fare_kes` (INTEGER)
- `actual_fare_kes` (INTEGER, nullable)
- `cancellation_reason` (TEXT, nullable)
- `created_at` / `started_at` / `completed_at` (TIMESTAMPTZ)

### 5. `trip_events`
Audit log of all trip state transitions:
- `id` (UUID, PK)
- `trip_id` (UUID, FK to `ride_requests.id`)
- `actor_id` (UUID, FK to `user_profiles.id`)
- `from_status` (TEXT)
- `to_status` (TEXT)
- `metadata` (JSONB)
- `created_at` (TIMESTAMPTZ)

### 6. `driver_dispatches`
Offers dispatched to candidate drivers:
- `id` (UUID, PK)
- `trip_id` (UUID, FK to `ride_requests.id`)
- `driver_id` (UUID, FK to `drivers.id`)
- `status` (TEXT: `'OFFERED'`, `'ACCEPTED'`, `'DECLINED'`, `'EXPIRED'`)
- `expires_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

### 7. `payments`
Payment transactions per trip:
- `id` (UUID, PK)
- `trip_id` (UUID, FK to `ride_requests.id`)
- `payer_id` (UUID, FK to `user_profiles.id`)
- `amount_kes` (INTEGER)
- `provider` (TEXT: `'MOCK'`, `'MPESA'`)
- `provider_tx_id` (TEXT)
- `status` (TEXT: `'PENDING'`, `'SUCCESS'`, `'FAILED'`, `'REFUNDED'`)
- `created_at` (TIMESTAMPTZ)

### 8. `wallets` & `wallet_transactions`
Driver wallet balance & double-entry ledger:
- `wallets`: `id`, `user_id`, `balance_kes`, `currency`, `updated_at`
- `wallet_transactions`: `id`, `wallet_id`, `type` (`'TRIP_EARNING'`, `'PLATFORM_COMMISSION'`, `'WITHDRAWAL'`, `'REFUND'`), `amount_kes`, `reference_id`, `status`, `created_at`

### 9. `ratings`
Driver & passenger ratings:
- `id` (UUID, PK)
- `trip_id` (UUID, FK to `ride_requests.id`)
- `rater_id` (UUID, FK to `user_profiles.id`)
- `ratee_id` (UUID, FK to `user_profiles.id`)
- `score` (INTEGER, 1 to 5)
- `comment` (TEXT, optional)
- `created_at` (TIMESTAMPTZ)
