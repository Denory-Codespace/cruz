# Cruz — Backend Architecture

## 1. Core Paradigm: PostgreSQL + Supabase Services
The backend is structured around PostgreSQL as the single source of truth, protected by Row Level Security, transactional functions, and Edge Functions/APIs for orchestration.

## 2. Security & Role-Based Access Control (RBAC)
User roles are stored in the database `user_profiles` table linked to `auth.users`:
- `PASSENGER`: Access own profile, ride requests, active trips, payments, ratings.
- `DRIVER`: Access own profile, registered vehicles, dispatches, active trips, wallet ledger.
- `OPERATIONS`: View live fleet operations, review driver submissions.
- `ADMIN` / `SUPER_ADMIN`: Full administrative control, financial auditing, system settings.

Clients **NEVER** set or alter roles. Database policies verify `auth.uid()` and user roles before permitting any write or sensitive read operation.

## 3. Server-Side State Machine for Trips
Trip status is guarded by the database and cannot transition out of order:

```text
REQUESTED → SEARCHING → DRIVER_ASSIGNED → DRIVER_ARRIVING → DRIVER_AT_PICKUP → TRIP_STARTED → TRIP_COMPLETED
                                  ↓                   ↓                  ↓
                              CANCELLED           CANCELLED          CANCELLED
```

Every transition generates an immutable record in `trip_events` for telemetry and audit trail.

## 4. API Client & Service Layer (`packages/api-client`)
Encapsulated domain services:
- `AuthService`: Sign in, sign up, session management, profile hydration.
- `TripService`: Request ride, cancel ride, track state, rate trip.
- `DriverService`: Toggle availability, accept/decline dispatches, advance trip stages.
- `FareService`: Calculate estimates, determine base/km/min charges.
- `WalletService`: Query balance, inspect ledger transactions.
- `AdminService`: Query fleet statistics, approve drivers, view active trips.
