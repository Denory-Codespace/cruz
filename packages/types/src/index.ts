// ==============================================================================
// CRUZ — CORE DOMAIN TYPES & DATA MODELS
// ==============================================================================

export type UserRole = 'PASSENGER' | 'DRIVER' | 'OPERATIONS' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  phone_number?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type DriverApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type DriverOperationalStatus = 'OFFLINE' | 'ONLINE' | 'IN_TRIP';

export interface Driver {
  id: string;
  user_profile?: UserProfile;
  national_id_number?: string | null;
  driving_license_number?: string | null;
  approval_status: DriverApprovalStatus;
  status: DriverOperationalStatus;
  is_available: boolean;
  current_lat?: number | null;
  current_lng?: number | null;
  last_location_updated_at?: string | null;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export type VehicleCategory = 'STANDARD' | 'COMFORT' | 'XL';

export interface Vehicle {
  id: string;
  driver_id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  category: VehicleCategory;
  is_active: boolean;
  created_at: string;
}

export type RideRequestStatus =
  | 'REQUESTED'
  | 'SEARCHING'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVING'
  | 'DRIVER_AT_PICKUP'
  | 'TRIP_STARTED'
  | 'TRIP_COMPLETED'
  | 'CANCELLED';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationPoint extends Coordinates {
  address: string;
}

export interface RideRequest {
  id: string;
  passenger_id: string;
  passenger?: UserProfile;
  driver_id?: string | null;
  driver?: Driver;
  vehicle?: Vehicle;
  status: RideRequestStatus;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  destination_address: string;
  destination_lat: number;
  destination_lng: number;
  estimated_distance_km: number;
  estimated_duration_mins: number;
  estimated_fare_kes: number;
  actual_fare_kes?: number | null;
  cancellation_reason?: string | null;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface TripEvent {
  id: string;
  trip_id: string;
  actor_id?: string | null;
  from_status?: RideRequestStatus | null;
  to_status: RideRequestStatus;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export type DispatchOfferStatus = 'OFFERED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

export interface DriverDispatch {
  id: string;
  trip_id: string;
  trip?: RideRequest;
  driver_id: string;
  status: DispatchOfferStatus;
  expires_at: string;
  created_at: string;
}

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentProviderType = 'MOCK' | 'MPESA';

export interface Payment {
  id: string;
  trip_id: string;
  payer_id: string;
  amount_kes: number;
  provider: PaymentProviderType;
  provider_tx_id?: string | null;
  status: PaymentStatus;
  created_at: string;
}

export type WalletTransactionType =
  | 'TRIP_EARNING'
  | 'PLATFORM_COMMISSION'
  | 'WITHDRAWAL'
  | 'REFUND'
  | 'BONUS'
  | 'ADJUSTMENT';

export interface Wallet {
  id: string;
  user_id: string;
  balance_kes: number;
  currency: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: WalletTransactionType;
  amount_kes: number;
  reference_id?: string | null;
  status: PaymentStatus;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Rating {
  id: string;
  trip_id: string;
  rater_id: string;
  ratee_id: string;
  score: number;
  comment?: string | null;
  created_at: string;
}

export interface FareCalculationInput {
  distanceKm: number;
  durationMins: number;
  category?: VehicleCategory;
}

export interface FareCalculationResult {
  baseFareKes: number;
  distanceFareKes: number;
  timeFareKes: number;
  totalFareKes: number;
  driverEarningKes: number;
  platformCommissionKes: number;
  currency: 'KES';
}
