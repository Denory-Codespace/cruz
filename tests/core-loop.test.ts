// ==============================================================================
// CRUZ — AUTOMATED UNIT & FOUNDING CORE LOOP TESTS
// ==============================================================================

import { calculateHaversineDistanceKm, calculateTripFare, formatKes } from '@cruz/utils';
import { tripService, driverService, adminService, mockStore } from '@cruz/api-client';

function runTests() {
  console.log('🧪 Starting Cruz Core Loop Automated Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // TEST 1: Haversine distance
  const dist = calculateHaversineDistanceKm(
    { lat: -1.2618, lng: 36.8044 }, // Westlands
    { lat: -1.2864, lng: 36.8172 }  // CBD
  );
  assert(dist > 2.0 && dist < 4.0, `Haversine distance Westlands->CBD is ~3km (got ${dist}km)`);

  // TEST 2: Fare Calculation
  const fareResult = calculateTripFare({ distanceKm: 6.5, durationMins: 18, category: 'STANDARD' });
  // Base: 150, Distance: 6.5*35=227.5, Time: 18*5=90 -> Total: 468 KES, Commission: 70 KES, Driver: 398 KES
  assert(fareResult.totalFareKes === 468, `Total fare matches formula (expected 468, got ${fareResult.totalFareKes})`);
  assert(fareResult.platformCommissionKes === 70, `Platform 15% commission is KES 70 (got ${fareResult.platformCommissionKes})`);
  assert(fareResult.driverEarningKes === 398, `Driver net earning is KES 398 (got ${fareResult.driverEarningKes})`);
  assert(fareResult.totalFareKes === fareResult.driverEarningKes + fareResult.platformCommissionKes, 'Fare integrity holds (Total = Driver + Platform)');

  // TEST 3: Currency Formatter
  assert(formatKes(650) === 'KES 650', `formatKes formats cleanly (got ${formatKes(650)})`);

  // TEST 4: End-to-End Core Mobility Loop Simulation
  console.log('\n🔄 Testing Complete Founding Loop (Passenger -> Match -> Accept -> Progress -> Complete -> Ledger -> Rate)...');

  // Step 1: Ensure driver is online
  const driverId = 'usr-driver-1';
  driverService.setAvailability(driverId, true, 'ONLINE');

  // Step 2: Passenger requests ride
  const initialWallet = driverService.getDriverWallet(driverId).wallet?.balance_kes || 0;
  const trip = mockStore.createRideRequest({
    passengerId: 'usr-passenger-1',
    pickupAddress: 'Sarit Centre, Westlands',
    pickupLat: -1.2618,
    pickupLng: 36.8044,
    destinationAddress: 'Kenyatta Avenue, CBD',
    destinationLat: -1.2864,
    destinationLng: 36.8172,
    estimatedDistanceKm: 3.5,
    estimatedDurationMins: 12,
    estimatedFareKes: 333,
  });

  assert(trip.status === 'SEARCHING', 'Ride created in SEARCHING state');

  // Step 3: Find dispatch offer
  const dispatch = mockStore.getState().dispatches.find((dp) => dp.trip_id === trip.id);
  assert(Boolean(dispatch), 'Dispatch offer generated for available online driver');

  if (dispatch) {
    // Step 4: Driver accepts
    const acceptRes = driverService.acceptDispatch(dispatch.id, driverId);
    assert(acceptRes.success === true, 'Driver successfully accepts dispatch');
    assert(mockStore.getState().trips.find((t) => t.id === trip.id)?.status === 'DRIVER_ASSIGNED', 'Trip state transitions to DRIVER_ASSIGNED');

    // Step 5: Advance through stages
    driverService.advanceTripStatus(trip.id, 'DRIVER_ARRIVING', driverId);
    assert(mockStore.getState().trips.find((t) => t.id === trip.id)?.status === 'DRIVER_ARRIVING', 'Trip moves to DRIVER_ARRIVING');

    driverService.advanceTripStatus(trip.id, 'DRIVER_AT_PICKUP', driverId);
    assert(mockStore.getState().trips.find((t) => t.id === trip.id)?.status === 'DRIVER_AT_PICKUP', 'Trip moves to DRIVER_AT_PICKUP');

    driverService.advanceTripStatus(trip.id, 'TRIP_STARTED', driverId);
    assert(mockStore.getState().trips.find((t) => t.id === trip.id)?.status === 'TRIP_STARTED', 'Trip moves to TRIP_STARTED');

    // Step 6: Complete trip and verify ledger
    driverService.advanceTripStatus(trip.id, 'TRIP_COMPLETED', driverId);
    const completedTrip = mockStore.getState().trips.find((t) => t.id === trip.id);
    assert(completedTrip?.status === 'TRIP_COMPLETED', 'Trip moves to TRIP_COMPLETED');

    const updatedWallet = driverService.getDriverWallet(driverId).wallet?.balance_kes || 0;
    assert(updatedWallet > initialWallet, `Driver wallet atomically credited (from KES ${initialWallet} to KES ${updatedWallet})`);

    // Step 7: Passenger rates driver
    const rating = mockStore.rateTrip(trip.id, 'usr-passenger-1', driverId, 5, 'Great driving and smooth ride!');
    assert(rating.score === 5, 'Passenger rating recorded with 5 stars');
  }

  console.log(`\n🏁 Test Suite Finished: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
