# Architecture Decision Records (ADRs)

## ADR 001: Monorepo Architecture
- **Decision**: Adopt a monorepo structure with npm workspaces (`apps/`, `packages/`, `supabase/`).
- **Rationale**: Shared TypeScript domain models, validation schemas, and UI design tokens eliminate API drift between web, mobile, and admin interfaces while keeping development zero-cost and unified.

## ADR 002: PostgreSQL + Supabase as Core System of Record
- **Decision**: Use Supabase-managed PostgreSQL as the primary transactional database instead of document stores (e.g. Firebase Firestore).
- **Rationale**: Ride-hailing workflows are fundamentally relational and transactional (trips, ledger movements, driver allocations). PostgreSQL offers ACID guarantees, Row Level Security, and rich SQL indexing.

## ADR 003: Double-Entry Style Auditable Ledger for Driver Earnings
- **Decision**: Driver wallet balances must be updated exclusively via append-only rows in `wallet_transactions` rather than direct mutable balance increments.
- **Rationale**: Guarantees complete auditability, prevents race conditions, and eliminates reconciliation discrepancies.

## ADR 004: Modular Provider Interfaces for Maps & Payments
- **Decision**: Abstract mapping (`MapsProvider`) and payment processing (`PaymentProvider`) behind TypeScript interfaces with local mock implementations.
- **Rationale**: Enables building and testing 100% of the passenger, driver, and trip workflows locally with KES 0 budget before connecting paid Google Maps APIs or Safaricom M-Pesa merchant accounts.

## ADR 005: Next.js App Router for Web/PWA & React Native Expo for Native Mobile
- **Decision**: Deploy Next.js App Router for passenger/driver web PWAs and admin portal, with Expo React Native sharing core packages for native apps.
- **Rationale**: Maximizes market reach in Kenya where low-data web/PWA accessibility is vital, while maintaining a clean bridge to native mobile apps.
