'use client';

import React, { useState, useEffect } from 'react';
import type { LocationPoint, RideRequest, VehicleCategory } from '@cruz/types';
import { NAIROBI_PRESET_LOCATIONS } from '@cruz/config';
import { Navbar, Button, Card, Badge, FareCard, DriverCard, Modal } from '@cruz/ui';
import { tripService, mockStore } from '@cruz/api-client';

export default function PassengerApp() {
  const [pickup, setPickup] = useState<LocationPoint>(NAIROBI_PRESET_LOCATIONS[0]);
  const [destination, setDestination] = useState<LocationPoint>(NAIROBI_PRESET_LOCATIONS[1]);
  const [category, setCategory] = useState<VehicleCategory>('STANDARD');
  const [activeTrip, setActiveTrip] = useState<RideRequest | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Fare quote
  const quote = tripService.estimateFare(pickup, destination, category);

  // Subscribe to mock store updates
  useEffect(() => {
    const unsubscribe = mockStore.subscribe((state) => {
      if (activeTrip) {
        const updated = state.trips.find((t) => t.id === activeTrip.id);
        if (updated) {
          setActiveTrip({ ...updated });
          if (updated.status === 'TRIP_COMPLETED' && !ratingSubmitted) {
            setShowRatingModal(true);
          }
        }
      }
    });
    return unsubscribe;
  }, [activeTrip, ratingSubmitted]);

  const handleRequestRide = async () => {
    setIsRequesting(true);
    try {
      const trip = await tripService.requestRide({
        passengerId: 'usr-passenger-1',
        pickupAddress: pickup.address,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        destinationAddress: destination.address,
        destinationLat: destination.lat,
        destinationLng: destination.lng,
        category,
      });
      setActiveTrip(trip);
    } catch (err) {
      console.error('Ride request error:', err);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancelRide = () => {
    if (activeTrip) {
      mockStore.advanceTripState(activeTrip.id, 'CANCELLED', 'usr-passenger-1');
      setActiveTrip(null);
    }
  };

  const handleSubmitRating = async () => {
    if (activeTrip && activeTrip.driver_id) {
      await tripService.rateTrip({
        tripId: activeTrip.id,
        raterId: 'usr-passenger-1',
        rateeId: activeTrip.driver_id,
        score: ratingScore,
        comment: ratingComment,
      });
      setRatingSubmitted(true);
      setShowRatingModal(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        appName="Passenger"
        userName="David Kamau"
        userRole="PASSENGER"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="http://localhost:3002" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="sm">Switch to Driver App</Button>
            </a>
            <a href="http://localhost:3003" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm">Live Ops</Button>
            </a>
          </div>
        }
      />

      <main style={{ flex: 1, padding: '24px 16px', maxWidth: '580px', margin: '0 auto', width: '100%' }}>
        {/* No active trip: Request Form */}
        {!activeTrip && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
                Where to today?
              </h1>
              <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>
                Choose your pickup and destination in Nairobi.
              </p>
            </div>

            <Card variant="elevated" padding="md">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#1D4ED8', display: 'block', marginBottom: '6px' }}>
                    ● PICKUP LOCATION
                  </label>
                  <select
                    value={pickup.address}
                    onChange={(e) => {
                      const selected = NAIROBI_PRESET_LOCATIONS.find((l) => l.address === e.target.value);
                      if (selected) setPickup(selected);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    {NAIROBI_PRESET_LOCATIONS.map((loc) => (
                      <option key={loc.address} value={loc.address}>
                        {loc.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#15803D', display: 'block', marginBottom: '6px' }}>
                    ■ DESTINATION
                  </label>
                  <select
                    value={destination.address}
                    onChange={(e) => {
                      const selected = NAIROBI_PRESET_LOCATIONS.find((l) => l.address === e.target.value);
                      if (selected) setDestination(selected);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    {NAIROBI_PRESET_LOCATIONS.map((loc) => (
                      <option key={loc.address} value={loc.address}>
                        {loc.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                    VEHICLE CATEGORY
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {(['STANDARD', 'COMFORT', 'XL'] as VehicleCategory[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '8px',
                          border: category === cat ? '2px solid #2563EB' : '1px solid #E2E8F0',
                          backgroundColor: category === cat ? '#DCEEFF' : '#FFFFFF',
                          color: category === cat ? '#1D4ED8' : '#475569',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <FareCard
              fare={quote.fare}
              distanceKm={quote.distanceKm}
              durationMins={quote.durationMins}
              pickupAddress={pickup.address}
              destinationAddress={destination.address}
            />

            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isRequesting}
              onClick={handleRequestRide}
            >
              Request Cruz ({quote.fare.currency} {quote.fare.totalFareKes})
            </Button>
          </div>
        )}

        {/* Active Trip Progression */}
        {activeTrip && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                Trip in Progress
              </h2>
              <Badge status={activeTrip.status} size="md" />
            </div>

            {/* Trip status detail */}
            <Card variant="highlight" padding="md">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeTrip.status === 'SEARCHING' && (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid #2563EB',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 12px',
                      }}
                    />
                    <strong style={{ fontSize: '16px', color: '#0F172A' }}>Finding nearby drivers...</strong>
                    <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                      Dispatching to online drivers in Nairobi. Open the Driver App to accept!
                    </p>
                  </div>
                )}

                {activeTrip.status === 'DRIVER_ASSIGNED' && (
                  <div style={{ color: '#1D4ED8', fontWeight: 600 }}>
                    ✓ Driver assigned! Driver is heading towards pickup.
                  </div>
                )}

                {activeTrip.status === 'DRIVER_ARRIVING' && (
                  <div style={{ color: '#1D4ED8', fontWeight: 600 }}>
                    🚗 Driver is arriving at your pickup location.
                  </div>
                )}

                {activeTrip.status === 'DRIVER_AT_PICKUP' && (
                  <div style={{ color: '#92400E', fontWeight: 600 }}>
                    📍 Driver has arrived at pickup. Please meet your driver.
                  </div>
                )}

                {activeTrip.status === 'TRIP_STARTED' && (
                  <div style={{ color: '#15803D', fontWeight: 600 }}>
                    🛣️ Trip is underway to {activeTrip.destination_address}.
                  </div>
                )}

                {activeTrip.status === 'TRIP_COMPLETED' && (
                  <div style={{ color: '#15803D', fontWeight: 700, fontSize: '16px' }}>
                    🎉 Trip completed! Total: KES {activeTrip.actual_fare_kes || activeTrip.estimated_fare_kes}
                  </div>
                )}
              </div>
            </Card>

            {/* Driver Details Card if assigned */}
            {activeTrip.driver && (
              <DriverCard
                driver={activeTrip.driver}
                vehicle={activeTrip.vehicle}
                etaMins={activeTrip.status === 'DRIVER_ASSIGNED' ? 4 : undefined}
              />
            )}

            {/* Actions */}
            {activeTrip.status !== 'TRIP_COMPLETED' && (
              <Button variant="danger" size="md" fullWidth onClick={handleCancelRide}>
                Cancel Ride
              </Button>
            )}

            {activeTrip.status === 'TRIP_COMPLETED' && (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  setActiveTrip(null);
                  setRatingSubmitted(false);
                }}
              >
                Book Another Ride
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Rating Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title="Rate Your Driver"
        footer={
          <Button variant="primary" onClick={handleSubmitRating}>
            Submit Rating
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <p style={{ color: '#475569', fontSize: '14px', textAlign: 'center' }}>
            How was your trip with {activeTrip?.driver?.user_profile?.full_name || 'your driver'}?
          </p>

          <div style={{ display: 'flex', gap: '8px', fontSize: '28px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRatingScore(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: star <= ratingScore ? '#F59E0B' : '#CBD5E1',
                  fontSize: '32px',
                }}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            placeholder="Leave a comment (optional)..."
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontFamily: 'inherit',
              fontSize: '14px',
              height: '80px',
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
