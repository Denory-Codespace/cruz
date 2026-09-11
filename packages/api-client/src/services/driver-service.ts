import type { Driver, RideRequest, RideRequestStatus } from '@cruz/types';
import { mockStore } from '../mock-store';

export class DriverService {
  setAvailability(driverId: string, isAvailable: boolean, status?: 'ONLINE' | 'OFFLINE'): Driver | null {
    return mockStore.setDriverAvailability(driverId, isAvailable, status);
  }

  acceptDispatch(dispatchId: string, driverId: string): { success: boolean; trip?: RideRequest; error?: string } {
    return mockStore.acceptDispatch(dispatchId, driverId);
  }

  advanceTripStatus(
    tripId: string,
    nextStatus: RideRequestStatus,
    driverId: string
  ): { success: boolean; trip?: RideRequest } {
    return mockStore.advanceTripState(tripId, nextStatus, driverId);
  }

  getDriverWallet(driverId: string) {
    const state = mockStore.getState();
    const wallet = state.wallets.find((w) => w.user_id === driverId);
    const transactions = wallet
      ? state.transactions.filter((tx) => tx.wallet_id === wallet.id)
      : [];
    return { wallet, transactions };
  }
}

export const driverService = new DriverService();
