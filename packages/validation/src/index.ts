// ==============================================================================
// CRUZ — SHARED ZOD VALIDATION SCHEMAS
// ==============================================================================

import { z } from 'zod';

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const LocationPointSchema = CoordinatesSchema.extend({
  address: z.string().min(3, 'Address must be at least 3 characters'),
});

export const VehicleCategorySchema = z.enum(['STANDARD', 'COMFORT', 'XL']);

export const RideRequestInputSchema = z.object({
  passengerId: z.string().uuid(),
  pickupAddress: z.string().min(3),
  pickupLat: z.number().min(-90).max(90),
  pickupLng: z.number().min(-180).max(180),
  destinationAddress: z.string().min(3),
  destinationLat: z.number().min(-90).max(90),
  destinationLng: z.number().min(-180).max(180),
  category: VehicleCategorySchema.default('STANDARD'),
});

export type RideRequestInput = z.infer<typeof RideRequestInputSchema>;

export const DriverOnboardingSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  phoneNumber: z.string().regex(/^\+254\d{9}$/, 'Must be a valid Kenyan number e.g. +254712345678'),
  nationalIdNumber: z.string().min(6, 'Valid National ID required'),
  drivingLicenseNumber: z.string().min(6, 'Valid Driving License required'),
  vehicleMake: z.string().min(2),
  vehicleModel: z.string().min(2),
  vehicleYear: z.number().int().min(2010).max(new Date().getFullYear()),
  vehicleColor: z.string().min(2),
  licensePlate: z.string().regex(/^K[A-Z]{2}\s?\d{3}[A-Z]$/i, 'Valid Kenyan plate e.g. KDA 123X'),
  category: VehicleCategorySchema.default('STANDARD'),
});

export type DriverOnboardingInput = z.infer<typeof DriverOnboardingSchema>;

export const TripStatusUpdateSchema = z.object({
  tripId: z.string().uuid(),
  driverId: z.string().uuid(),
  newStatus: z.enum([
    'DRIVER_ARRIVING',
    'DRIVER_AT_PICKUP',
    'TRIP_STARTED',
    'TRIP_COMPLETED',
    'CANCELLED',
  ]),
  cancellationReason: z.string().optional(),
});

export const RateTripSchema = z.object({
  tripId: z.string().uuid(),
  raterId: z.string().uuid(),
  rateeId: z.string().uuid(),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});
