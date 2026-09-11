# Cruz — Frontend Architecture

## 1. Web Applications (Next.js App Router)
- **Framework**: Next.js (latest stable App Router), React, TypeScript.
- **Styling**: Vanilla CSS & CSS Modules mapped to Cruz Design System design tokens (CSS custom properties in `packages/ui`).
- **State Management**: React state + React Context for global auth/session and active trip state. Realtime subscriptions via Supabase client listeners.
- **Target Applications**:
  1. `apps/passenger-web`: Mobile-first responsive PWA for passengers to request, track, and pay for rides.
  2. `apps/driver-web`: Driver operations console for onboarding, availability toggling, accepting dispatches, and managing trips.
  3. `apps/admin-web`: Desktop-optimized, responsive operations portal for fleet tracking, driver verification, and ledger review.
  4. `apps/marketing-web`: High-conversion public landing page communicating Cruz's value proposition.

## 2. Shared Component Library (`packages/ui`)
Reusable primitives ensuring a consistent, high-aesthetic Cruz brand experience:
- `Button` (Primary Blue, Secondary Outline, Danger, Ghost, Loading)
- `Input` / `Select` / `FormField` (Accessible labels, error states, focus rings)
- `Card` (Elevation, subtle borders, responsive padding)
- `Badge` (Status indicators: `Searching`, `Assigned`, `En Route`, `Completed`, `Cancelled`)
- `Modal` / `Drawer` / `BottomSheet` (Accessible overlays for mobile and desktop)
- `TripProgressCard` (Live step indicator for ride lifecycle)
- `DriverCard` (Photo, vehicle details, rating, contact)
- `FareCard` (Itemized price breakdown in KES)
- `MapContainer` (Map canvas with driver marker, origin, destination, and route polyline)

## 3. Brand Design System Tokens
```css
:root {
  /* Brand Primary Colors */
  --cruz-blue-50: #F0F7FF;
  --cruz-blue-100: #DCEEFF;
  --cruz-blue-500: #2563EB;
  --cruz-blue-600: #1D4ED8;

  /* Accent Colors */
  --cruz-yellow-100: #FFF1B8;
  --cruz-yellow-500: #D97706;

  /* Success Colors */
  --cruz-green-100: #DDF5E3;
  --cruz-green-500: #16A34A;
  --cruz-green-600: #15803D;

  /* Neutrals & Surfaces */
  --cruz-bg: #F8FAFC;
  --cruz-surface: #FFFFFF;
  --cruz-text-primary: #0F172A;
  --cruz-text-secondary: #64748B;
  --cruz-border: #E2E8F0;
  
  /* Radii & Shadows */
  --cruz-radius-sm: 6px;
  --cruz-radius-md: 10px;
  --cruz-radius-lg: 16px;
  --cruz-radius-full: 9999px;
  --cruz-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --cruz-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07);
}
```
