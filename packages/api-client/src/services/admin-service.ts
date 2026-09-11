import { mockStore } from '../mock-store';

export class AdminService {
  getOperationalMetrics() {
    const state = mockStore.getState();
    const activeDrivers = state.drivers.filter((d) => d.status === 'ONLINE' || d.status === 'IN_TRIP');
    const onlineDrivers = state.drivers.filter((d) => d.status === 'ONLINE' && d.is_available);
    const activeTrips = state.trips.filter(
      (t) => t.status !== 'TRIP_COMPLETED' && t.status !== 'CANCELLED'
    );
    const completedTrips = state.trips.filter((t) => t.status === 'TRIP_COMPLETED');

    const grossRideValueKes = completedTrips.reduce(
      (sum, t) => sum + (t.actual_fare_kes || t.estimated_fare_kes),
      0
    );
    const platformCommissionKes = Math.round(grossRideValueKes * 0.15);

    return {
      activeDriversCount: activeDrivers.length,
      onlineDriversCount: onlineDrivers.length,
      activeTripsCount: activeTrips.length,
      completedTripsCount: completedTrips.length,
      grossRideValueKes,
      platformCommissionKes,
      drivers: state.drivers,
      trips: state.trips,
      users: state.users,
    };
  }

  approveDriver(driverId: string): boolean {
    return mockStore.approveDriver(driverId);
  }
}

export const adminService = new AdminService();
