# Cruz — Realtime & Geolocation Architecture

## 1. Realtime Strategy & Efficiency
To prevent overloading the database and exceeding Supabase free-tier connection limits, realtime updates are categorized into:

1. **High-Value State Changes (PostgreSQL Changes via Supabase Realtime)**:
   - `ride_requests` updates (e.g. status changing to `DRIVER_ASSIGNED`, `TRIP_COMPLETED`).
   - `driver_dispatches` updates (incoming request for driver, accepted, expired).
2. **Ephemeral Driver GPS Updates (Supabase Realtime Broadcast Channels)**:
   - Live coordinates during an active trip are broadcast over lightweight WebSocket channels without writing every second to disk.
   - Periodic breadcrumbs (e.g., every 30–60s) or trip waypoint checkpoints are recorded to PostgreSQL for safety and dispute resolution.

## 2. Realtime Channels
- `trip:{trip_id}`: Private broadcast channel between assigned driver and passenger for live coordinates and ETA updates.
- `driver:{driver_id}`: Private channel for dispatch offers and notifications.
- `admin:live_ops`: Operational stream of active vehicle positions and fleet status.

## 3. Simulated Geolocation for Development
For local testing and MVP validation without physical vehicles, the system provides a `SimulatedLocationProvider` that interpolates coordinates along predefined Nairobi routes (e.g. Westlands → Kilimani → Nairobi CBD), allowing full end-to-end UX testing.
