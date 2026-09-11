# Cruz — Modern Ride-Hailing & Mobility Platform

Cruz is a modern, reliable, and accessible ride-hailing and mobility platform built from zero for Kenya (and future expanding markets).

---

## 🚀 Core MVP Loop
The platform is engineered around the core end-to-end mobility loop:
1. **Passenger Requests Ride** → Dynamic fare estimate generated based on distance, time, and category.
2. **Matching & Dispatch** → Nearby eligible, online, and approved drivers receive the request.
3. **Driver Accepts** → Concurrency-safe assignment and trip lock.
4. **Driver Arrives & Starts Trip** → Realtime location updates and trip progress tracking.
5. **Trip Completion** → Server-calculated fare finalized.
6. **Payment & Financial Ledger** → Atomic transaction recorded (Mock Provider / M-Pesa ready), driver earnings credited, and platform commission logged.
7. **Passenger Rating** → Driver rating and review recorded.

---

## 🏗️ Architecture & Monorepo Structure

```text
cruz/
├── apps/
│   ├── passenger-web/     # Next.js Passenger Web & PWA
│   ├── driver-web/        # Next.js Driver Web & PWA
│   ├── passenger-mobile/  # Expo / React Native Passenger App
│   ├── driver-mobile/     # Expo / React Native Driver App
│   ├── admin-web/         # Next.js Operations & Live Ops Dashboard
│   └── marketing-web/     # Next.js Marketing & Driver Recruitment Site
├── packages/
│   ├── ui/                # Cruz Design System primitives & components
│   ├── types/             # Shared TypeScript domain models & DTOs
│   ├── validation/        # Zod validation schemas
│   ├── api-client/        # Shared API & Supabase Client wrappers
│   ├── config/            # Platform pricing, brand tokens, and constants
│   └── utils/             # Geolocation, currency (KES), and helper utilities
├── supabase/
│   ├── migrations/        # PostgreSQL migrations & RLS policies
│   ├── functions/         # Edge Functions for dispatch & webhooks
│   └── seed/              # Development mock seeds
└── docs/                  # Architecture, product specs, database, security
```

---

## 🎨 Visual Identity & Brand Design Tokens
- **Brand Personality**: Light, fresh, modern, accessible, trustworthy, and youthful.
- **Primary Color Palette**:
  - **Light Blue**: `#DCEEFF` (Trust, Technology, Primary actions)
  - **Light Yellow**: `#FFF1B8` (Energy, Highlights, Accents)
  - **Light Green**: `#DDF5E3` (Success, Availability, Safe states)
  - **Dark Neutral**: `#0F172A` (Text, Primary Contrast)

---

## 🛠️ Tech Stack
- **Web**: Next.js (App Router), React, TypeScript, Vanilla CSS / CSS Modules
- **Mobile**: React Native, Expo, TypeScript
- **Database & Auth**: Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS)
- **Realtime**: Supabase Realtime (optimized GPS/dispatch broadcasting)
- **Maps**: Modular `MapsProvider` abstraction (Mock Maps for Dev / Google Maps API ready)
- **Payments**: Modular `PaymentProvider` abstraction (Mock Provider for Dev / M-Pesa Daraja ready)
- **Ledger**: Auditable, append-only double-entry style financial transaction ledger

---

## 📖 Documentation
Detailed engineering and product documentation can be found in [`/docs`](./docs):
- [Product Vision & MVP Blueprint](./docs/product/vision.md)
- [System Architecture Overview](./docs/architecture/overview.md)
- [Database Schema & Financial Ledger](./docs/database/schema.md)
- [Technology Decisions (ADRs)](./docs/decisions/technology-decisions.md)
- [Environment Setup & Installation](./docs/setup/environment.md)
- [Security & Privacy Model](./docs/security/security-model.md)

---

## 🔒 Free-First & Zero Budget Policy
Cruz is engineered to operate on free and open-source tiers during development and initial pilot phases. No paid services, subscriptions, or infrastructure instances are incurred without human authorization.
