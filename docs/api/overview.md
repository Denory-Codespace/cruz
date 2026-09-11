# Cruz — API Design & Service Interface

## Overview
Cruz utilizes Supabase client with strongly typed service wrappers and server actions to interact with PostgreSQL and Edge Functions.

## Core API & Domain Services

### 1. Trip Service (`TripService`)
- `estimateFare(origin, destination, category)` $\rightarrow$ `FareEstimateResponse`
- `requestRide(params)` $\rightarrow$ `RideRequest`
- `cancelRide(tripId, reason)` $\rightarrow$ `RideRequest`
- `getRideDetails(tripId)` $\rightarrow$ `TripDetails`
- `rateTrip(tripId, score, comment)` $\rightarrow$ `Rating`

### 2. Driver Service (`DriverService`)
- `setAvailability(driverId, isOnline, lat, lng)` $\rightarrow$ `DriverStatus`
- `acceptDispatch(dispatchId)` $\rightarrow$ `DispatchResult`
- `declineDispatch(dispatchId)` $\rightarrow$ `void`
- `updateTripStatus(tripId, status: 'DRIVER_ARRIVING' | 'DRIVER_AT_PICKUP' | 'TRIP_STARTED' | 'TRIP_COMPLETED')` $\rightarrow$ `TripDetails`
- `getEarningsSummary(driverId)` $\rightarrow$ `DriverEarningsSummary`

### 3. Operations Service (`AdminService`)
- `getFleetMetrics()` $\rightarrow$ `OperationalMetrics`
- `listDrivers(filter)` $\rightarrow$ `DriverListResponse`
- `approveDriver(driverId)` $\rightarrow$ `DriverProfile`
- `rejectDriver(driverId, reason)` $\rightarrow$ `DriverProfile`
- `listLiveTrips()` $\rightarrow$ `ActiveTrip[]`
- `setUserSuspended(userId, isSuspended)` $\rightarrow$ `UserProfile`
