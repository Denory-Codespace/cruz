import type {
  Coordinates,
  FareCalculationResult,
  Rating,
  RideRequest,
  RideRequestStatus,
  VehicleCategory,
} from '@cruz/types';
import { calculateTripFare, estimateDrivingRoute } from '@cruz/utils';
import { mockStore } from '../mock-store';
import { MockPaymentProvider } from '../providers/payment-provider';

export class TripService {
  private paymentProvider = new MockPaymentProvider();

  estimateFare(
    origin: Coordinates,
    destination: Coordinates,
    category: VehicleCategory = 'STANDARD'
  ): { distanceKm: number; durationMins: number; fare: FareCalculationResult } {
    const { distanceKm, durationMins } = estimateDrivingRoute(origin, destination);
    const fare = calculateTripFare({ distanceKm, durationMins, category });
    return { distanceKm, durationMins, fare };
  }

  async requestRide(params: {
    passengerId: string;
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    destinationAddress: string;
    destinationLat: number;
    destinationLng: number;
    category?: VehicleCategory;
  }): Promise<RideRequest> {
    const { distanceKm, durationMins, fare } = this.estimateFare(
      { lat: params.pickupLat, lng: params.pickupLng },
      { lat: params.destinationLat, lng: params.destinationLng },
      params.category
    );

    return mockStore.createRideRequest({
      passengerId: params.passengerId,
      pickupAddress: params.pickupAddress,
      pickupLat: params.pickupLat,
      pickupLng: params.pickupLng,
      destinationAddress: params.destinationAddress,
      destinationLat: params.destinationLat,
      destinationLng: params.destinationLng,
      estimatedDistanceKm: distanceKm,
      estimatedDurationMins: durationMins,
      estimatedFareKes: fare.totalFareKes,
    });
  }

  async rateTrip(params: {
    tripId: string;
    raterId: string;
    rateeId: string;
    score: number;
    comment?: string;
  }): Promise<Rating> {
    return mockStore.rateTrip(
      params.tripId,
      params.raterId,
      params.rateeId,
      params.score,
      params.comment
    );
  }
}

export const tripService = new TripService();
