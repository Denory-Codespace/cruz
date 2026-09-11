# Cruz — Engineering & Product Roadmap

## Phase 0: Engineering Foundation (Current)
- [x] Environment inspection and toolchain assessment
- [x] Monorepo workspace configuration & AGENTS.md rules
- [x] Product blueprints, architecture specs, and database schema designs
- [x] Zero-cost infrastructure and development strategy

## Phase 1: Database, Schema & Core Shared Packages
- [ ] PostgreSQL migration scripts & RLS policies in `supabase/migrations`
- [ ] Shared packages setup:
  - `packages/types`: Domain interfaces (Trip, Driver, Passenger, Payment, Wallet)
  - `packages/validation`: Zod schemas for all client/server inputs
  - `packages/config`: Platform constants and default fare formulas
  - `packages/utils`: Currency formatting (KES) and geolocation math
  - `packages/ui`: Cruz Design System components and CSS tokens

## Phase 2: Core Domain Services & Mock Providers
- [ ] `packages/api-client`: Supabase client and typed service layer
- [ ] `FareEngine`: Server-side fare estimation
- [ ] `DispatchEngine`: Driver ranking, offer generation, and concurrency locking
- [ ] `MockPaymentProvider` & `SimulatedLocationProvider`

## Phase 3: Web Applications Implementation
- [ ] `apps/marketing-web`: High-conversion Cruz public site
- [ ] `apps/passenger-web`: Mobile-first Passenger Web/PWA
- [ ] `apps/driver-web`: Driver operations Web/PWA
- [ ] `apps/admin-web`: Operations and live fleet monitoring dashboard

## Phase 4: Verification & Automated Testing
- [ ] Unit tests for Fare calculations, state machine transitions, and financial ledger
- [ ] Integration tests for ride request dispatch & concurrent driver acceptance
- [ ] End-to-end simulated trip loop verification

## Phase 5: Pilot Readiness & Production Gate
- [ ] Setup of remote Supabase project with environment variables
- [ ] Pilot onboarding checklist for 5–10 drivers and 20–50 riders
- [ ] Safaricom M-Pesa Daraja and Google Maps Platform integration (Paid Service Gate)
