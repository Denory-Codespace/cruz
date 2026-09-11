# Cruz — Core User Flows

## 1. Passenger Ride Request Flow
1. **Launch App**: Passenger opens Passenger Web/PWA or Mobile App.
2. **Set Origin & Destination**: Passenger searches or clicks on map/preset points (e.g. Westlands to CBD).
3. **Review Quote**: System queries Fare Engine to display estimated distance (km), estimated time (mins), and fare in KES.
4. **Confirm Request**: Passenger taps "Request Cruz". Backend creates a `ride_requests` record with state `REQUESTED`.
5. **Searching & Dispatch**: State transitions to `SEARCHING`. Dispatch Engine queries online, approved drivers within search radius.
6. **Driver Match**: State transitions to `DRIVER_ASSIGNED`. Passenger sees driver photo, name, rating, vehicle model, color, and license plate.
7. **Pickup & In-Transit**:
   - Driver marks `DRIVER_ARRIVING` → Passenger sees updated ETA and driver movement.
   - Driver marks `DRIVER_AT_PICKUP` → Passenger receives notification that driver is waiting.
   - Driver marks `TRIP_STARTED` → Map view switches to in-trip navigation mode.
8. **Completion & Payment**: Driver marks `TRIP_COMPLETED`. Final fare calculated. Payment processed via Mock/M-Pesa provider.
9. **Rating**: Passenger rates driver (1–5 stars) and optionally leaves comments.

## 2. Driver Onboarding & Ride Execution Flow
1. **Sign Up**: Driver signs up via Driver Web or App.
2. **Onboarding Submission**: Submits personal details, vehicle data (make/model/plate), and uploads ID & insurance docs. Status is `PENDING_APPROVAL`.
3. **Admin Approval**: Operations team verifies details in Admin Portal and approves driver. Status becomes `APPROVED`.
4. **Go Online**: Driver toggles switch to `ONLINE` (`is_available = true`).
5. **Receive Dispatch**: Pop-up alert appears with 30s countdown showing pickup distance, destination, and fare quote.
6. **Acceptance**: Driver taps "Accept". Concurrency lock assigns the trip. Status moves to `DRIVER_ASSIGNED`.
7. **Ride Progress**: Driver advances through `DRIVER_ARRIVING` → `DRIVER_AT_PICKUP` → `TRIP_STARTED` → `TRIP_COMPLETED`.
8. **Earnings Recorded**: Upon trip completion, net earnings are automatically deposited into driver's digital wallet ledger.

## 3. Admin Operations Flow
1. **Login**: Staff logs into `admin-web` with `ADMIN` or `OPERATIONS` role.
2. **Live Ops Screen**: Visual table and map of all online drivers and active trips.
3. **Driver Approval Queue**: Inspects pending applications, reviews uploaded documents, and clicks "Approve" or "Reject".
4. **Audit & Safety**: Views specific trip logs, driver transaction records, and can freeze accounts if safety violations occur.
