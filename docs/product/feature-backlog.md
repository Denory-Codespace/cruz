# Cruz — Product Feature Backlog

## Priority Categorization
- **P0**: MVP Critical (Mandatory for founding loop demonstration)
- **P1**: Post-MVP Polish (Enhanced reliability, M-Pesa production, native push notifications)
- **P2**: Scaling & Growth (Driver incentives, advanced dispatch, safety features)
- **P3**: Future Expansion (Boda, deliveries, corporate billing)

---

## Backlog Items

### FOUNDATION & ARCHITECTURE
- [x] [P0] Monorepo setup with shared types, validation, and design tokens
- [x] [P0] Comprehensive architectural blueprints and AGENTS.md
- [ ] [P0] Supabase database schema, migration scripts, and RLS policies
- [ ] [P0] Shared TypeScript domain models and Zod schemas

### AUTHENTICATION & ACCESS CONTROL
- [ ] [P0] Supabase Auth integration for Passenger, Driver, and Admin
- [ ] [P0] Role-Based Access Control (RBAC) middleware & RLS verification
- [ ] [P1] Phone SMS OTP authentication integration

### PASSENGER EXPERIENCE
- [ ] [P0] Passenger Web / PWA layout with Cruz Design System
- [ ] [P0] Pickup and destination search / coordinate selector
- [ ] [P0] Realtime fare quote generator
- [ ] [P0] Ride request submission and status tracking
- [ ] [P0] Driver arrival tracking with simulated GPS / Realtime updates
- [ ] [P0] Post-trip rating and receipt view
- [ ] [P1] Passenger Mobile (Expo React Native app)
- [ ] [P2] Saved favorite locations (Home, Work)

### DRIVER EXPERIENCE
- [ ] [P0] Driver Web / PWA onboarding and profile management
- [ ] [P0] Vehicle details submission
- [ ] [P0] Online / Offline toggle with availability broadcast
- [ ] [P0] Dispatch request modal with accept/decline action
- [ ] [P0] Step-by-step trip state execution (Arriving -> Arrived -> Start -> Complete)
- [ ] [P0] Driver earnings wallet overview
- [ ] [P1] Driver Mobile (Expo React Native app)
- [ ] [P2] Heatmap of high-demand areas

### DISPATCH & CONCURRENCY
- [ ] [P0] Server-side matching algorithm (radius, online status, eligibility)
- [ ] [P0] Concurrency lock preventing double driver assignment
- [ ] [P0] Timeout and re-dispatch logic when driver declines or ignores
- [ ] [P2] Batch dispatch & multi-tier radius expansion

### FARE ENGINE & FINANCIAL LEDGER
- [ ] [P0] Deterministic fare calculation module (Base + Per Km + Per Min)
- [ ] [P0] Append-only `wallet_transactions` ledger (KES minor units)
- [ ] [P0] Automated driver net credit and platform commission deduction
- [ ] [P0] Mock payment provider for zero-cost testing
- [ ] [P1] Safaricom M-Pesa Daraja API integration (STK Push)

### OPERATIONS & ADMIN
- [ ] [P0] Operational metrics dashboard (Active trips, revenue, online drivers)
- [ ] [P0] Driver application review queue & approval/rejection actions
- [ ] [P0] Active ride monitoring table and live map view
- [ ] [P0] User suspension and account freeze controls
- [ ] [P1] Financial reconciliation reports and export

### MARKETING & PUBLIC SITE
- [ ] [P0] Modern responsive landing page for Cruz
- [ ] [P0] Driver recruitment & passenger information pages
