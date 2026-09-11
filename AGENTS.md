# AGENTS.md — Cruz Engineering Directives & Rules

## 1. PROJECT IDENTITY & GOAL
- **Product Name**: Cruz
- **Description**: Next-generation ride-hailing and mobility platform built for Kenya (and future markets).
- **Core Mission**: Enable safe, reliable, and accessible mobility starting with a **KES 0 budget** through clean architecture, high reliability, and zero unnecessary infrastructure spend.
- **Founding Milestone (MVP Loop)**:
  `Passenger requests ride` → `Driver found & assigned` → `Driver accepts` → `Passenger tracks driver` → `Trip starts` → `Trip completes` → `Fare calculated` → `Payment recorded (Mock/M-Pesa)` → `Driver earnings & platform commission recorded` → `Passenger rates driver`.

---

## 2. NON-NEGOTIABLE CORE PRINCIPLES
1. **Free-First & Zero Paid Spends**:
   - Zero budget assumption.
   - NEVER create paid subscriptions, paid cloud instances, paid database plans, or paid API usage.
   - All external paid services (SMS gateways, paid Maps, paid hosting, M-Pesa production keys) require explicit human approval via the **Paid Service Gate**.
2. **Build for Reality (No Fake Simulators as Architecture)**:
   - Real relational database (Supabase PostgreSQL with RLS).
   - Real server-side state machine.
   - Real authorization and security rules.
   - When simulation is needed for development (e.g. simulated GPS, mock payment), encapsulate it cleanly behind provider interfaces (`PaymentProvider`, `MapsProvider`, `GeolocationProvider`) so production drivers/providers swap in without rewriting backend logic.
3. **Financial Ledger Integrity**:
   - Never mutate balances via raw `balance = balance + X`.
   - All money movements (trip earnings, commissions, refunds, bonuses) MUST be append-only, idempotent, atomic records in `wallet_transactions` using integer minor units (KES).
4. **Server-Controlled State Transitions**:
   - Trip states (`REQUESTED`, `SEARCHING`, `DRIVER_ASSIGNED`, `DRIVER_ARRIVING`, `DRIVER_AT_PICKUP`, `TRIP_STARTED`, `TRIP_COMPLETED`, `CANCELLED`) are enforced strictly on the server/database. Clients NEVER arbitrarily set status.
5. **Security & Authorization First**:
   - Role-Based Access Control (`PASSENGER`, `DRIVER`, `OPERATIONS`, `ADMIN`, `SUPER_ADMIN`).
   - Server-enforced PostgreSQL Row Level Security (RLS) policies on every sensitive table. No `USING (true)` bypasses on sensitive data.
   - No secrets committed to git or exposed to browser/mobile clients.
6. **Design System & Aesthetics**:
   - Clean, light, fresh, trustworthy, and modern.
   - Brand tokens: Light Blue (`#DCEEFF`), Light Yellow (`#FFF1B8`), Light Green (`#DDF5E3`).
   - No dark-mode-only clunky designs, no unreadable neon pastel messes, no heavy gratuitous glassmorphism. Accessible and mobile-first.

---

## 3. MONOREPO STRUCTURE & BOUNDARIES
```text
cruz/
├── apps/
│   ├── passenger-web/     # Next.js Passenger Web / PWA
│   ├── driver-web/        # Next.js Driver Web / PWA (Pilot/Web experience)
│   ├── passenger-mobile/  # React Native / Expo Passenger App
│   ├── driver-mobile/     # React Native / Expo Driver App
│   ├── admin-web/         # Next.js Operations & Admin Portal
│   └── marketing-web/     # Next.js Public Marketing Site
├── packages/
│   ├── ui/                # Shared Cruz Design System components & tokens
│   ├── types/             # Shared TypeScript domain models & DTOs
│   ├── validation/        # Shared Zod schemas (client + server validation)
│   ├── api-client/        # Shared Supabase / API client abstractions
│   ├── config/            # Shared constants, pricing defaults, brand config
│   └── utils/             # Shared math, formatting (KES currency), geo utilities
├── supabase/
│   ├── migrations/        # SQL schema migrations
│   ├── functions/         # Supabase Edge Functions (e.g., dispatch, payment webhooks)
│   └── seed/              # Development seed data
└── docs/                  # Comprehensive engineering, product, and architecture docs
```

---

## 4. CODING STANDARDS & PRACTICES
- **Language**: TypeScript strict mode across all apps and packages.
- **Validation**: Validate all inputs at client boundaries for UX, and ALWAYS validate on the server with Zod before processing.
- **Error Handling**: Graceful, user-friendly error messages on the frontend; structured contextual error logging on the server. Never crash unhandled.
- **Financial Calculations**: Store currency in integer cents / lowest minor unit (or integer KES) avoiding floating point drift.
- **Concurrency Protection**: Critical operations (driver ride acceptance, wallet ledger updates) must use database locks (`FOR UPDATE`), idempotency keys, or transactional functions.

---

## 5. AGENT BEHAVIOR & WORKFLOW
1. **Understand First**: Always check existing docs, types, and schema before modifying or introducing features.
2. **Adhere to Plan**: Follow approved implementation phases. Do not jump to out-of-scope backlog items (e.g. corporate accounts, food delivery).
3. **Verify Everything**: Run typechecks, unit tests, and build checks before marking tasks done.
4. **Human Interaction Boundary**: When encountering external account setups (Supabase credentials, Google Maps keys), STOP and provide step-by-step instructions. Never request sensitive credentials in chat.
