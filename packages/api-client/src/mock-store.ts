// ==============================================================================
// CRUZ — REACTIVE CROSS-TAB STORE FOR SIMULATION & LOCAL TESTING
// ==============================================================================

import type {
  Driver,
  RideRequest,
  RideRequestStatus,
  UserProfile,
  Vehicle,
  Wallet,
  WalletTransaction,
  DriverDispatch,
  Rating,
} from '@cruz/types';
import { calculateTripFare } from '@cruz/utils';

export interface PlatformState {
  users: UserProfile[];
  drivers: Driver[];
  vehicles: Vehicle[];
  trips: RideRequest[];
  dispatches: DriverDispatch[];
  wallets: Wallet[];
  transactions: WalletTransaction[];
  ratings: Rating[];
}

const STORAGE_KEY = 'cruz_platform_state_v1';
const BROADCAST_CHANNEL_NAME = 'cruz_sync_channel';

const INITIAL_STATE: PlatformState = {
  users: [
    {
      id: 'usr-passenger-1',
      role: 'PASSENGER',
      full_name: 'David Kamau',
      phone_number: '+254712345678',
      is_active: true,
      created_at: '2026-09-11T20:00:00.000Z',
      updated_at: '2026-09-11T20:00:00.000Z',
    },
    {
      id: 'usr-driver-1',
      role: 'DRIVER',
      full_name: 'Samuel Mwangi',
      phone_number: '+254722334455',
      is_active: true,
      created_at: '2026-09-11T20:00:00.000Z',
      updated_at: '2026-09-11T20:00:00.000Z',
    },
    {
      id: 'usr-driver-2',
      role: 'DRIVER',
      full_name: 'Brian Omondi',
      phone_number: '+254733445566',
      is_active: true,
      created_at: '2026-09-11T20:00:00.000Z',
      updated_at: '2026-09-11T20:00:00.000Z',
    },
    {
      id: 'usr-admin-1',
      role: 'ADMIN',
      full_name: 'Denzel',
      phone_number: '+254714082283',
      is_active: true,
      created_at: '2026-09-11T20:00:00.000Z',
      updated_at: '2026-09-11T20:00:00.000Z',
    },
  ],
  drivers: [
    {
      id: 'usr-driver-1',
      approval_status: 'APPROVED',
      status: 'ONLINE',
      is_available: true,
      current_lat: -1.2683,
      current_lng: 36.8111,
      rating_avg: 4.95,
      rating_count: 52,
      national_id_number: '12345678',
      driving_license_number: 'DL-987654',
      created_at: '2026-09-11T20:00:00.000Z',
      updated_at: '2026-09-11T20:00:00.000Z',
    },
    {
      id: 'usr-driver-2',
      approval_status: 'APPROVED',
      status: 'ONLINE',
      is_available: true,
      current_lat: -1.2884,
      current_lng: 36.7831,
      rating_avg: 4.88,
      rating_count: 38,
      national_id_number: '23456789',
      driving_license_number: 'DL-876543',
      created_at: '2026-09-11T20:00:00.000Z',
      updated_at: '2026-09-11T20:00:00.000Z',
    },
  ],
  vehicles: [
    {
      id: 'veh-1',
      driver_id: 'usr-driver-1',
      make: 'Toyota',
      model: 'Vitz',
      year: 2018,
      color: 'Silver',
      license_plate: 'KDA 123X',
      category: 'STANDARD',
      is_active: true,
      created_at: '2026-09-11T20:00:00.000Z',
    },
    {
      id: 'veh-2',
      driver_id: 'usr-driver-2',
      make: 'Mazda',
      model: 'Demio',
      year: 2019,
      color: 'Pearl White',
      license_plate: 'KDB 456Y',
      category: 'STANDARD',
      is_active: true,
      created_at: '2026-09-11T20:00:00.000Z',
    },
  ],
  trips: [],
  dispatches: [],
  wallets: [
    {
      id: 'wal-1',
      user_id: 'usr-driver-1',
      balance_kes: 3450,
      currency: 'KES',
      updated_at: '2026-09-11T20:00:00.000Z',
    },
    {
      id: 'wal-2',
      user_id: 'usr-driver-2',
      balance_kes: 1280,
      currency: 'KES',
      updated_at: '2026-09-11T20:00:00.000Z',
    },
  ],
  transactions: [
    {
      id: 'tx-1',
      wallet_id: 'wal-1',
      type: 'TRIP_EARNING',
      amount_kes: 420,
      status: 'SUCCESS',
      created_at: '2026-09-11T19:00:00.000Z',
    },
  ],
  ratings: [],
};

class CruzMockStore {
  private state: PlatformState;
  private listeners: Set<(state: PlatformState) => void> = new Set();
  private channel: BroadcastChannel | null = null;

  constructor() {
    this.state = this.loadState();
    this.initCrossTabSync();
  }

  private loadState(): PlatformState {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.warn('Failed to load state from localStorage:', e);
      }
    }
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  private saveState() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.warn('Failed to save state to localStorage:', e);
      }
    }
  }

  private initCrossTabSync() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          this.channel.onmessage = (event) => {
            if (event.data && event.data.state) {
              this.state = event.data.state;
              this.notifyLocal();
            }
          };
        }

        // Storage event fallback
        window.addEventListener('storage', (e) => {
          if (e.key === STORAGE_KEY && e.newValue) {
            try {
              this.state = JSON.parse(e.newValue);
              this.notifyLocal();
            } catch {}
          }
        });
      } catch (e) {
        console.warn('Cross-tab broadcast channel not supported in this environment');
      }
    }
  }

  getState(): PlatformState {
    return this.state;
  }

  subscribe(listener: (state: PlatformState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyLocal() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  private notify() {
    this.saveState();
    this.notifyLocal();
    if (this.channel) {
      try {
        this.channel.postMessage({ state: this.state });
      } catch (e) {
        console.warn('Failed to broadcast state:', e);
      }
    }
  }

  reset() {
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this.notify();
  }

  // --- Passenger actions ---
  createRideRequest(params: {
    passengerId: string;
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    destinationAddress: string;
    destinationLat: number;
    destinationLng: number;
    estimatedDistanceKm: number;
    estimatedDurationMins: number;
    estimatedFareKes: number;
  }): RideRequest {
    const passenger = this.state.users.find((u) => u.id === params.passengerId);
    const trip: RideRequest = {
      id: `trip-${Date.now()}`,
      passenger_id: params.passengerId,
      passenger,
      status: 'SEARCHING',
      pickup_address: params.pickupAddress,
      pickup_lat: params.pickupLat,
      pickup_lng: params.pickupLng,
      destination_address: params.destinationAddress,
      destination_lat: params.destinationLat,
      destination_lng: params.destinationLng,
      estimated_distance_km: params.estimatedDistanceKm,
      estimated_duration_mins: params.estimatedDurationMins,
      estimated_fare_kes: params.estimatedFareKes,
      created_at: new Date().toISOString(),
    };

    this.state.trips.unshift(trip);

    // Find available online driver and dispatch offer
    const availableDriver = this.state.drivers.find(
      (d) => d.status === 'ONLINE' && d.is_available && d.approval_status === 'APPROVED'
    );

    if (availableDriver) {
      const dispatch: DriverDispatch = {
        id: `disp-${Date.now()}`,
        trip_id: trip.id,
        trip,
        driver_id: availableDriver.id,
        status: 'OFFERED',
        expires_at: new Date(Date.now() + 60000).toISOString(),
        created_at: new Date().toISOString(),
      };
      this.state.dispatches.unshift(dispatch);
    }

    this.notify();
    return trip;
  }

  // --- Driver actions ---
  setDriverAvailability(driverId: string, isAvailable: boolean, status?: 'ONLINE' | 'OFFLINE'): Driver | null {
    const driver = this.state.drivers.find((d) => d.id === driverId);
    if (!driver) return null;

    driver.is_available = isAvailable;
    if (status) driver.status = status;
    driver.updated_at = new Date().toISOString();
    this.notify();
    return driver;
  }

  acceptDispatch(dispatchId: string, driverId: string): { success: boolean; trip?: RideRequest; error?: string } {
    const dispatch = this.state.dispatches.find((d) => d.id === dispatchId && d.driver_id === driverId);
    if (!dispatch || dispatch.status !== 'OFFERED') {
      return { success: false, error: 'DISPATCH_EXPIRED_OR_NOT_FOUND' };
    }

    const trip = this.state.trips.find((t) => t.id === dispatch.trip_id);
    if (!trip || trip.status !== 'SEARCHING') {
      dispatch.status = 'EXPIRED';
      this.notify();
      return { success: false, error: 'TRIP_ALREADY_ASSIGNED' };
    }

    const driver = this.state.drivers.find((d) => d.id === driverId);
    const driverUser = this.state.users.find((u) => u.id === driverId);
    const vehicle = this.state.vehicles.find((v) => v.driver_id === driverId);

    if (driver) {
      driver.status = 'IN_TRIP';
      driver.is_available = false;
      if (driverUser) driver.user_profile = driverUser;
    }

    dispatch.status = 'ACCEPTED';
    trip.driver_id = driverId;
    trip.driver = driver;
    trip.vehicle = vehicle;
    trip.status = 'DRIVER_ASSIGNED';

    this.notify();
    return { success: true, trip };
  }

  advanceTripState(
    tripId: string,
    nextStatus: RideRequestStatus,
    actorId: string
  ): { success: boolean; trip?: RideRequest } {
    const trip = this.state.trips.find((t) => t.id === tripId);
    if (!trip) return { success: false };

    trip.status = nextStatus;

    if (nextStatus === 'TRIP_STARTED') {
      trip.started_at = new Date().toISOString();
    } else if (nextStatus === 'TRIP_COMPLETED') {
      trip.completed_at = new Date().toISOString();
      trip.actual_fare_kes = trip.estimated_fare_kes;

      // Calculate earnings & platform commission
      const fareResult = calculateTripFare({
        distanceKm: trip.estimated_distance_km,
        durationMins: trip.estimated_duration_mins,
      });

      // Update Driver Wallet & Ledger
      if (trip.driver_id) {
        let wallet = this.state.wallets.find((w) => w.user_id === trip.driver_id);
        if (!wallet) {
          wallet = {
            id: `wal-${Date.now()}`,
            user_id: trip.driver_id,
            balance_kes: 0,
            currency: 'KES',
            updated_at: new Date().toISOString(),
          };
          this.state.wallets.push(wallet);
        }

        wallet.balance_kes += fareResult.driverEarningKes;
        wallet.updated_at = new Date().toISOString();

        this.state.transactions.unshift({
          id: `tx-${Date.now()}`,
          wallet_id: wallet.id,
          type: 'TRIP_EARNING',
          amount_kes: fareResult.driverEarningKes,
          reference_id: trip.id,
          status: 'SUCCESS',
          metadata: { commissionKes: fareResult.platformCommissionKes },
          created_at: new Date().toISOString(),
        });

        // Set driver back online and available
        const driver = this.state.drivers.find((d) => d.id === trip.driver_id);
        if (driver) {
          driver.status = 'ONLINE';
          driver.is_available = true;
        }
      }
    } else if (nextStatus === 'CANCELLED') {
      // If trip cancelled, free the driver
      if (trip.driver_id) {
        const driver = this.state.drivers.find((d) => d.id === trip.driver_id);
        if (driver) {
          driver.status = 'ONLINE';
          driver.is_available = true;
        }
      }
    }

    this.notify();
    return { success: true, trip };
  }

  rateTrip(tripId: string, raterId: string, rateeId: string, score: number, comment?: string): Rating {
    const rating: Rating = {
      id: `rate-${Date.now()}`,
      trip_id: tripId,
      rater_id: raterId,
      ratee_id: rateeId,
      score,
      comment,
      created_at: new Date().toISOString(),
    };
    this.state.ratings.push(rating);

    // Update driver rating average
    const driver = this.state.drivers.find((d) => d.id === rateeId);
    if (driver) {
      const allDriverRatings = this.state.ratings.filter((r) => r.ratee_id === rateeId);
      const avg = allDriverRatings.reduce((sum, r) => sum + r.score, 0) / allDriverRatings.length;
      driver.rating_avg = Math.round(avg * 100) / 100;
      driver.rating_count = allDriverRatings.length;
    }

    this.notify();
    return rating;
  }

  // --- Admin operations ---
  approveDriver(driverId: string): boolean {
    const driver = this.state.drivers.find((d) => d.id === driverId);
    if (driver) {
      driver.approval_status = 'APPROVED';
      driver.updated_at = new Date().toISOString();
      this.notify();
      return true;
    }
    return false;
  }
}

// Global singleton instance
export const mockStore = new CruzMockStore();
