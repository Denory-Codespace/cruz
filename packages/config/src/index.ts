// ==============================================================================
// CRUZ — PLATFORM CONFIGURATION & CONSTANTS
// ==============================================================================

import type { LocationPoint, VehicleCategory } from '@cruz/types';

export const BRAND_CONFIG = {
  name: 'Cruz',
  tagline: 'Fast, reliable, modern rides in Kenya',
  currency: 'KES',
  countryCode: '+254',
  supportEmail: 'support@cruz.ke',
  colors: {
    primaryBlue: '#DCEEFF',
    primaryBlueDark: '#1D4ED8',
    secondaryYellow: '#FFF1B8',
    secondaryYellowDark: '#B45309',
    accentGreen: '#DDF5E3',
    accentGreenDark: '#15803D',
    neutralDark: '#0F172A',
    surfaceWhite: '#FFFFFF',
    borderLight: '#E2E8F0',
  },
} as const;

export interface CategoryPricing {
  baseFareKes: number;
  perKmKes: number;
  perMinuteKes: number;
  minimumFareKes: number;
  platformCommissionPercent: number;
}

export const PRICING_CONFIG: Record<VehicleCategory, CategoryPricing> = {
  STANDARD: {
    baseFareKes: 150,
    perKmKes: 35,
    perMinuteKes: 5,
    minimumFareKes: 200,
    platformCommissionPercent: 15,
  },
  COMFORT: {
    baseFareKes: 220,
    perKmKes: 48,
    perMinuteKes: 7,
    minimumFareKes: 300,
    platformCommissionPercent: 15,
  },
  XL: {
    baseFareKes: 300,
    perKmKes: 65,
    perMinuteKes: 10,
    minimumFareKes: 450,
    platformCommissionPercent: 18,
  },
};

export const DISPATCH_CONFIG = {
  defaultSearchRadiusKm: 8,
  driverOfferTimeoutSeconds: 30,
  maxDriverDispatchAttempts: 5,
  gpsUpdateThrottleMs: 5000,
} as const;

export const NAIROBI_PRESET_LOCATIONS: LocationPoint[] = [
  {
    address: 'Sarit Centre, Westlands, Nairobi',
    lat: -1.2618,
    lng: 36.8044,
  },
  {
    address: 'Nairobi CBD (Kenyatta Avenue)',
    lat: -1.2864,
    lng: 36.8172,
  },
  {
    address: 'Yaya Centre, Kilimani, Nairobi',
    lat: -1.2975,
    lng: 36.7878,
  },
  {
    address: 'Upper Hill Medical Centre, Nairobi',
    lat: -1.2982,
    lng: 36.8142,
  },
  {
    address: 'Village Market, Gigiri, Nairobi',
    lat: -1.2294,
    lng: 36.8041,
  },
  {
    address: 'Jomo Kenyatta International Airport (JKIA)',
    lat: -1.3192,
    lng: 36.9275,
  },
];
