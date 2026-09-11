import type { Coordinates, LocationPoint } from '@cruz/types';
import { estimateDrivingRoute } from '@cruz/utils';

export interface RouteResult {
  distanceKm: number;
  durationMins: number;
  waypoints: Coordinates[];
}

export interface MapsProvider {
  calculateRoute(origin: Coordinates, destination: Coordinates): Promise<RouteResult>;
  reverseGeocode(coord: Coordinates): Promise<string>;
}

export class MockMapsProvider implements MapsProvider {
  async calculateRoute(origin: Coordinates, destination: Coordinates): Promise<RouteResult> {
    const { distanceKm, durationMins } = estimateDrivingRoute(origin, destination);

    // Generate 5 intermediate simulated waypoints
    const waypoints: Coordinates[] = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      waypoints.push({
        lat: origin.lat + (destination.lat - origin.lat) * ratio,
        lng: origin.lng + (destination.lng - origin.lng) * ratio,
      });
    }

    return { distanceKm, durationMins, waypoints };
  }

  async reverseGeocode(coord: Coordinates): Promise<string> {
    return `Location (${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)}), Nairobi`;
  }
}
