// ==============================================================================
// CRUZ — SHARED UTILITIES & MATH MODULE
// ==============================================================================

import type { Coordinates, FareCalculationInput, FareCalculationResult } from '@cruz/types';
import { PRICING_CONFIG } from '@cruz/config';

/**
 * Calculates straight-line distance in kilometers between two GPS coordinates
 * using the Haversine formula.
 */
export function calculateHaversineDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

/**
 * Estimates driving distance and duration assuming average Nairobi traffic speeds (approx 22 km/h city average).
 */
export function estimateDrivingRoute(
  origin: Coordinates,
  destination: Coordinates
): { distanceKm: number; durationMins: number } {
  const straightLine = calculateHaversineDistanceKm(origin, destination);
  // Real driving routes are typically ~1.25x straight-line distance
  const distanceKm = Math.max(1.0, Math.round(straightLine * 1.25 * 10) / 10);
  // Average city speed 22 km/h + 3 min base traffic buffer
  const durationMins = Math.max(3, Math.round((distanceKm / 22) * 60 + 3));

  return { distanceKm, durationMins };
}

/**
 * Deterministically calculates passenger fare, driver earnings, and platform commission.
 * Follows strict integer rounding in KES minor units to avoid float drift.
 */
export function calculateTripFare(input: FareCalculationInput): FareCalculationResult {
  const category = input.category || 'STANDARD';
  const pricing = PRICING_CONFIG[category];

  const distanceFare = input.distanceKm * pricing.perKmKes;
  const timeFare = input.durationMins * pricing.perMinuteKes;
  const calculatedTotal = pricing.baseFareKes + distanceFare + timeFare;

  const totalFareKes = Math.max(pricing.minimumFareKes, Math.round(calculatedTotal));
  const platformCommissionKes = Math.round(
    (totalFareKes * pricing.platformCommissionPercent) / 100
  );
  const driverEarningKes = totalFareKes - platformCommissionKes;

  return {
    baseFareKes: pricing.baseFareKes,
    distanceFareKes: Math.round(distanceFare),
    timeFareKes: Math.round(timeFare),
    totalFareKes,
    driverEarningKes,
    platformCommissionKes,
    currency: 'KES',
  };
}

/**
 * Formats integer KES amounts into clean display strings (e.g. "KES 650").
 */
export function formatKes(amount: number): string {
  return `KES ${Math.round(amount).toLocaleString('en-KE')}`;
}

/**
 * Formats date/time into Kenyan standard format (EAT).
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
