# Cruz — Dispatch & Matching Engine

## 1. Dispatch Algorithm
The MVP dispatch algorithm operates deterministically:

1. **Trigger**: Passenger submits a ride request (`ride_requests` table).
2. **Driver Candidate Search**:
   - Status: `status = 'ONLINE'`
   - Availability: `is_available = true`
   - Approval: `approval_status = 'APPROVED'`
   - Active Trip: `current_trip_id IS NULL`
   - Radius: Within defined proximity (e.g. 5–10 km).
3. **Candidate Ranking**:
   - Ordered by shortest straight-line or estimated driving distance to pickup.
4. **Offer Generation**:
   - System creates a `driver_dispatches` offer record with an expiration timestamp (e.g., 30 seconds).
5. **Acceptance & Concurrency Lock**:
   - When driver taps "Accept", a database transaction checks whether the ride request is still `SEARCHING`.
   - If available, it updates `ride_requests.driver_id = driver_id` and `ride_requests.status = 'DRIVER_ASSIGNED'`, marks `driver.is_available = false`, and expires other active offers.
   - If another driver accepted first, the transaction rolls back gracefully and returns `OFFER_ALREADY_TAKEN`.
