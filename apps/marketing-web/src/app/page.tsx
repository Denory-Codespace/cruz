'use client';

import React, { useState, useEffect } from 'react';
import type { LocationPoint, RideRequest, RideRequestStatus, VehicleCategory, Driver, DriverDispatch } from '@cruz/types';
import { NAIROBI_PRESET_LOCATIONS } from '@cruz/config';
import { Navbar, Button, Card, Badge, FareCard, DriverCard, Modal } from '@cruz/ui';
import { formatKes, formatDateTime } from '@cruz/utils';
import { tripService, driverService, adminService, mockStore } from '@cruz/api-client';

export default function CruzStudio() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'split' | 'passenger' | 'driver' | 'admin'>('split');

  // --- PASSENGER STATE ---
  const [pickup, setPickup] = useState<LocationPoint>(NAIROBI_PRESET_LOCATIONS[0]);
  const [destination, setDestination] = useState<LocationPoint>(NAIROBI_PRESET_LOCATIONS[1]);
  const [category, setCategory] = useState<VehicleCategory>('STANDARD');
  const [passengerActiveTrip, setPassengerActiveTrip] = useState<RideRequest | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // --- DRIVER STATE ---
  const driverId = 'usr-driver-1';
  const [driver, setDriver] = useState<Driver | null>(null);
  const [driverActiveTrip, setDriverActiveTrip] = useState<RideRequest | null>(null);
  const [incomingDispatch, setIncomingDispatch] = useState<DriverDispatch | null>(null);
  const [walletData, setWalletData] = useState(driverService.getDriverWallet(driverId));

  // --- ADMIN STATE ---
  const [metrics, setMetrics] = useState(adminService.getOperationalMetrics());

  // Fare quote
  const quote = tripService.estimateFare(pickup, destination, category);

  // Sync state across all views
  const syncAll = () => {
    const state = mockStore.getState();

    // Driver sync
    const d = state.drivers.find((item) => item.id === driverId);
    if (d) setDriver({ ...d });

    const dTrip = state.trips.find(
      (t) => t.driver_id === driverId && t.status !== 'TRIP_COMPLETED' && t.status !== 'CANCELLED'
    );
    setDriverActiveTrip(dTrip ? { ...dTrip } : null);

    const dispatch = state.dispatches.find((dp) => dp.driver_id === driverId && dp.status === 'OFFERED');
    setIncomingDispatch(dispatch ? { ...dispatch } : null);
    setWalletData(driverService.getDriverWallet(driverId));

    // Passenger sync
    const pTrip = state.trips.find(
      (t) => t.passenger_id === 'usr-passenger-1' && t.status !== 'CANCELLED'
    );
    if (pTrip) {
      setPassengerActiveTrip({ ...pTrip });
      if (pTrip.status === 'TRIP_COMPLETED' && !ratingSubmitted) {
        setShowRatingModal(true);
      }
    } else {
      setPassengerActiveTrip(null);
    }

    // Admin sync
    setMetrics(adminService.getOperationalMetrics());
  };

  useEffect(() => {
    setMounted(true);
    syncAll();
    const unsubscribe = mockStore.subscribe(syncAll);
    return unsubscribe;
  }, [ratingSubmitted]);

  // --- Passenger Handlers ---
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
      setPassengerActiveTrip(trip);
    } catch (err) {
      console.error('Ride request error:', err);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancelRide = () => {
    if (passengerActiveTrip) {
      mockStore.advanceTripState(passengerActiveTrip.id, 'CANCELLED', 'usr-passenger-1');
      setPassengerActiveTrip(null);
    }
  };

  const handleSubmitRating = async () => {
    if (passengerActiveTrip && passengerActiveTrip.driver_id) {
      await tripService.rateTrip({
        tripId: passengerActiveTrip.id,
        raterId: 'usr-passenger-1',
        rateeId: passengerActiveTrip.driver_id,
        score: ratingScore,
        comment: ratingComment,
      });
      setRatingSubmitted(true);
      setShowRatingModal(false);
    }
  };

  // --- Driver Handlers ---
  const handleToggleOnline = () => {
    if (!driver) return;
    const nextStatus = driver.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    driverService.setAvailability(driverId, nextStatus === 'ONLINE', nextStatus);
  };

  const handleAcceptDispatch = () => {
    if (incomingDispatch) {
      const result = driverService.acceptDispatch(incomingDispatch.id, driverId);
      if (result.success && result.trip) {
        setDriverActiveTrip(result.trip);
        setIncomingDispatch(null);
      }
    }
  };

  const handleDeclineDispatch = () => {
    if (incomingDispatch) {
      incomingDispatch.status = 'DECLINED';
      setIncomingDispatch(null);
    }
  };

  const handleAdvanceStatus = (nextStatus: RideRequestStatus) => {
    const targetTrip = driverActiveTrip || passengerActiveTrip;
    if (targetTrip) {
      const res = driverService.advanceTripStatus(targetTrip.id, nextStatus, driverId);
      if (res.success && res.trip) {
        setDriverActiveTrip(res.trip.status === 'TRIP_COMPLETED' ? null : res.trip);
      }
    }
  };

  const handleResetDemo = () => {
    mockStore.reset();
    setPassengerActiveTrip(null);
    setDriverActiveTrip(null);
    setIncomingDispatch(null);
    setRatingSubmitted(false);
    setShowRatingModal(false);
  };

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#2563EB', fontWeight: 700, fontSize: '18px' }}>Initializing Cruz Mobility Platform...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '20px',
              padding: '4px 12px',
              borderRadius: '8px',
              letterSpacing: '-0.5px',
            }}
          >
            CRUZ
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
            Founding Mobility Studio (Nairobi, Kenya)
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveTab('split')}
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'split' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'split' ? '#2563EB' : '#64748B',
              boxShadow: activeTab === 'split' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            ⚡ Split Screen (Live Demo)
          </button>
          <button
            onClick={() => setActiveTab('passenger')}
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'passenger' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'passenger' ? '#2563EB' : '#64748B',
              boxShadow: activeTab === 'passenger' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Passenger App
          </button>
          <button
            onClick={() => setActiveTab('driver')}
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'driver' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'driver' ? '#2563EB' : '#64748B',
              boxShadow: activeTab === 'driver' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Driver Console
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'admin' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'admin' ? '#2563EB' : '#64748B',
              boxShadow: activeTab === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Live Ops Admin
          </button>
        </div>

        <div>
          <Button variant="outline" size="sm" onClick={handleResetDemo}>
            🔄 Reset Demo Data
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '24px' }}>
        {/* ==============================================================================
            SPLIT SCREEN VIEW: Passenger on Left, Driver on Right, Live Ops at bottom
            ============================================================================== */}
        {activeTab === 'split' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1300px', margin: '0 auto' }}>
            {/* Split Screen Top Banner */}
            <div
              style={{
                backgroundColor: '#DCEEFF',
                border: '1px solid #B8DBFF',
                padding: '12px 20px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong style={{ color: '#1D4ED8', fontSize: '15px' }}>
                  🎯 Side-by-Side Instant Test Mode
                </strong>
                <p style={{ color: '#1E40AF', fontSize: '13px', marginTop: '2px' }}>
                  Request a ride on the Passenger panel (Left) $\rightarrow$ Watch the Driver panel (Right) alert in real time with zero network lag!
                </p>
              </div>
              <Badge variant="blue" size="md">Realtime Connected</Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* LEFT COLUMN: PASSENGER INTERFACE */}
              <Card variant="elevated" padding="lg" style={{ borderTop: '4px solid #2563EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>
                      Passenger View (David Kamau)
                    </span>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                      Request a Ride
                    </h2>
                  </div>
                  {passengerActiveTrip && <Badge status={passengerActiveTrip.status} size="md" />}
                </div>

                {!passengerActiveTrip && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#1D4ED8', display: 'block', marginBottom: '4px' }}>
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
                          <option key={loc.address} value={loc.address}>{loc.address}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#15803D', display: 'block', marginBottom: '4px' }}>
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
                          <option key={loc.address} value={loc.address}>{loc.address}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                        CATEGORY
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        {(['STANDARD', 'COMFORT', 'XL'] as VehicleCategory[]).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              border: category === cat ? '2px solid #2563EB' : '1px solid #E2E8F0',
                              backgroundColor: category === cat ? '#DCEEFF' : '#FFFFFF',
                              color: category === cat ? '#1D4ED8' : '#475569',
                              fontWeight: 700,
                              fontSize: '12px',
                              cursor: 'pointer',
                            }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

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

                {passengerActiveTrip && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Card variant="highlight" padding="md">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {passengerActiveTrip.status === 'SEARCHING' && (
                          <div style={{ textAlign: 'center', padding: '12px 0' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                border: '3px solid #2563EB',
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                                margin: '0 auto 8px',
                              }}
                            />
                            <strong style={{ color: '#0F172A' }}>Searching nearby drivers...</strong>
                            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                              Offer dispatched to Driver Samuel Mwangi! Check Driver console on the right 👉
                            </p>
                          </div>
                        )}

                        {passengerActiveTrip.status === 'DRIVER_ASSIGNED' && (
                          <div style={{ color: '#1D4ED8', fontWeight: 600 }}>
                            ✓ Driver Samuel assigned! Preparing vehicle.
                          </div>
                        )}

                        {passengerActiveTrip.status === 'DRIVER_ARRIVING' && (
                          <div style={{ color: '#1D4ED8', fontWeight: 600 }}>
                            🚗 Driver is arriving at your pickup location.
                          </div>
                        )}

                        {passengerActiveTrip.status === 'DRIVER_AT_PICKUP' && (
                          <div style={{ color: '#92400E', fontWeight: 600 }}>
                            📍 Driver has arrived at pickup.
                          </div>
                        )}

                        {passengerActiveTrip.status === 'TRIP_STARTED' && (
                          <div style={{ color: '#15803D', fontWeight: 600 }}>
                            🛣️ Trip is underway to {passengerActiveTrip.destination_address}.
                          </div>
                        )}

                        {passengerActiveTrip.status === 'TRIP_COMPLETED' && (
                          <div style={{ color: '#15803D', fontWeight: 700 }}>
                            🎉 Trip completed! Total: KES {passengerActiveTrip.actual_fare_kes || passengerActiveTrip.estimated_fare_kes}
                          </div>
                        )}
                      </div>
                    </Card>

                    {passengerActiveTrip.driver && (
                      <DriverCard
                        driver={passengerActiveTrip.driver}
                        vehicle={passengerActiveTrip.vehicle}
                        etaMins={passengerActiveTrip.status === 'DRIVER_ASSIGNED' ? 4 : undefined}
                      />
                    )}

                    {passengerActiveTrip.status !== 'TRIP_COMPLETED' && (
                      <Button variant="danger" size="md" fullWidth onClick={handleCancelRide}>
                        Cancel Ride
                      </Button>
                    )}

                    {passengerActiveTrip.status === 'TRIP_COMPLETED' && (
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={() => {
                          setPassengerActiveTrip(null);
                          setRatingSubmitted(false);
                        }}
                      >
                        Book Another Ride
                      </Button>
                    )}
                  </div>
                )}
              </Card>

              {/* RIGHT COLUMN: DRIVER INTERFACE */}
              <Card variant="elevated" padding="lg" style={{ borderTop: '4px solid #16A34A' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase' }}>
                      Driver Console (Samuel Mwangi)
                    </span>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                      Vehicle: Toyota Vitz (KDA 123X)
                    </h2>
                  </div>
                  <Badge variant={driver?.status === 'ONLINE' ? 'green' : driver?.status === 'IN_TRIP' ? 'blue' : 'gray'} size="md">
                    {driver?.status || 'OFFLINE'}
                  </Badge>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Status Toggle & Wallet */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                        Driver Wallet
                      </span>
                      <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>
                        {formatKes(walletData.wallet?.balance_kes || 0)}
                      </h3>
                    </div>
                    {driver?.status !== 'IN_TRIP' && (
                      <Button
                        variant={driver?.status === 'ONLINE' ? 'danger' : 'accent'}
                        size="sm"
                        onClick={handleToggleOnline}
                      >
                        {driver?.status === 'ONLINE' ? 'Go Offline' : 'Go Online'}
                      </Button>
                    )}
                  </div>

                  {/* Incoming Dispatch Offer Alert */}
                  {incomingDispatch && (
                    <div
                      style={{
                        backgroundColor: '#FFF1B8',
                        border: '2px solid #FEE380',
                        padding: '16px',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#92400E', fontSize: '15px' }}>
                          🔔 NEW DISPATCH OFFER!
                        </strong>
                        <Badge variant="yellow" size="sm">Expires in 60s</Badge>
                      </div>

                      <div style={{ fontSize: '13px', color: '#0F172A' }}>
                        <div><strong>Pickup:</strong> {incomingDispatch.trip?.pickup_address}</div>
                        <div><strong>Drop-off:</strong> {incomingDispatch.trip?.destination_address}</div>
                        <div style={{ marginTop: '4px', color: '#16A34A', fontWeight: 700, fontSize: '14px' }}>
                          Est. Fare: {formatKes(incomingDispatch.trip?.estimated_fare_kes || 0)} ({incomingDispatch.trip?.estimated_distance_km} km)
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <Button variant="outline" size="sm" onClick={handleDeclineDispatch}>
                          Decline
                        </Button>
                        <Button variant="primary" size="sm" style={{ flex: 1 }} onClick={handleAcceptDispatch}>
                          ✓ Accept Ride
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Active Trip Steps for Driver */}
                  {driverActiveTrip && (
                    <Card variant="highlight" padding="md">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <strong style={{ color: '#0F172A', fontSize: '15px' }}>Trip Execution</strong>
                        <Badge status={driverActiveTrip.status} size="sm" />
                      </div>

                      <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                        <div><strong>Rider:</strong> {driverActiveTrip.passenger?.full_name || 'David Kamau'}</div>
                        <div><strong>Pickup:</strong> {driverActiveTrip.pickup_address}</div>
                        <div><strong>Drop-off:</strong> {driverActiveTrip.destination_address}</div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {driverActiveTrip.status === 'DRIVER_ASSIGNED' && (
                          <Button variant="primary" size="md" fullWidth onClick={() => handleAdvanceStatus('DRIVER_ARRIVING')}>
                            1. Tap to Start Navigating to Pickup
                          </Button>
                        )}
                        {driverActiveTrip.status === 'DRIVER_ARRIVING' && (
                          <Button variant="accent" size="md" fullWidth onClick={() => handleAdvanceStatus('DRIVER_AT_PICKUP')}>
                            2. Arrived at Pickup Location
                          </Button>
                        )}
                        {driverActiveTrip.status === 'DRIVER_AT_PICKUP' && (
                          <Button variant="primary" size="md" fullWidth onClick={() => handleAdvanceStatus('TRIP_STARTED')}>
                            3. Passenger Onboard — Start Trip
                          </Button>
                        )}
                        {driverActiveTrip.status === 'TRIP_STARTED' && (
                          <Button
                            variant="primary"
                            size="md"
                            fullWidth
                            style={{ backgroundColor: '#16A34A', borderColor: '#15803D' }}
                            onClick={() => handleAdvanceStatus('TRIP_COMPLETED')}
                          >
                            4. Arrived at Destination — Complete Trip
                          </Button>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Recent Ledger */}
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Recent Wallet Ledger
                    </h4>
                    {walletData.transactions.length === 0 ? (
                      <p style={{ fontSize: '12px', color: '#94A3B8' }}>No completed trips yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {walletData.transactions.slice(0, 3).map((tx) => (
                          <div
                            key={tx.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '6px 10px',
                              backgroundColor: '#F8FAFC',
                              borderRadius: '6px',
                              fontSize: '12px',
                            }}
                          >
                            <span style={{ color: '#0F172A', fontWeight: 600 }}>{tx.type.replace('_', ' ')}</span>
                            <strong style={{ color: '#16A34A' }}>+{formatKes(tx.amount_kes)}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* BOTTOM SECTION: LIVE OPERATIONS KPI MONITOR */}
            <Card variant="elevated" padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                  Live Ops Fleet & Revenue Monitor
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Live Platform Telemetry</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Active Online Drivers</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#16A34A' }}>{metrics.onlineDriversCount}</h3>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Active Trips</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#2563EB' }}>{metrics.activeTripsCount}</h3>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Gross Ride Value</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{formatKes(metrics.grossRideValueKes)}</h3>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#FFFDF0', borderRadius: '8px', border: '1px solid #FEE380' }}>
                  <span style={{ fontSize: '11px', color: '#92400E', fontWeight: 700 }}>Platform Net Revenue (15%)</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#92400E' }}>{formatKes(metrics.platformCommissionKes)}</h3>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* STANDALONE PASSENGER VIEW */}
        {activeTab === 'passenger' && (
          <div style={{ maxWidth: '580px', margin: '0 auto' }}>
            <Card variant="elevated" padding="lg">
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
                Where to today?
              </h2>
              {/* Form & Card */}
              {!passengerActiveTrip ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <select
                    value={pickup.address}
                    onChange={(e) => {
                      const sel = NAIROBI_PRESET_LOCATIONS.find((l) => l.address === e.target.value);
                      if (sel) setPickup(sel);
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  >
                    {NAIROBI_PRESET_LOCATIONS.map((l) => <option key={l.address} value={l.address}>{l.address}</option>)}
                  </select>

                  <select
                    value={destination.address}
                    onChange={(e) => {
                      const sel = NAIROBI_PRESET_LOCATIONS.find((l) => l.address === e.target.value);
                      if (sel) setDestination(sel);
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  >
                    {NAIROBI_PRESET_LOCATIONS.map((l) => <option key={l.address} value={l.address}>{l.address}</option>)}
                  </select>

                  <FareCard
                    fare={quote.fare}
                    distanceKm={quote.distanceKm}
                    durationMins={quote.durationMins}
                    pickupAddress={pickup.address}
                    destinationAddress={destination.address}
                  />

                  <Button variant="primary" size="lg" fullWidth onClick={handleRequestRide} isLoading={isRequesting}>
                    Request Cruz ({quote.fare.currency} {quote.fare.totalFareKes})
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <Badge status={passengerActiveTrip.status} size="md" />
                  {passengerActiveTrip.driver && (
                    <DriverCard driver={passengerActiveTrip.driver} vehicle={passengerActiveTrip.vehicle} />
                  )}
                  {passengerActiveTrip.status !== 'TRIP_COMPLETED' ? (
                    <Button variant="danger" fullWidth onClick={handleCancelRide}>Cancel Ride</Button>
                  ) : (
                    <Button variant="primary" fullWidth onClick={() => setPassengerActiveTrip(null)}>Book Another Ride</Button>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* STANDALONE DRIVER VIEW */}
        {activeTab === 'driver' && (
          <div style={{ maxWidth: '580px', margin: '0 auto' }}>
            <Card variant="elevated" padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>Driver Console</h2>
                <Badge variant={driver?.status === 'ONLINE' ? 'green' : 'gray'}>{driver?.status}</Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Wallet Balance</span>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>{formatKes(walletData.wallet?.balance_kes || 0)}</h3>
                </div>
                <Button variant={driver?.status === 'ONLINE' ? 'danger' : 'accent'} size="sm" onClick={handleToggleOnline}>
                  {driver?.status === 'ONLINE' ? 'Go Offline' : 'Go Online'}
                </Button>
              </div>

              {incomingDispatch && (
                <Card variant="highlight" padding="md" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>🔔 New Ride Dispatch</strong>
                    <Badge variant="yellow" size="sm">Offer</Badge>
                  </div>
                  <p style={{ fontSize: '13px' }}>Pickup: {incomingDispatch.trip?.pickup_address}</p>
                  <p style={{ fontSize: '13px' }}>Drop-off: {incomingDispatch.trip?.destination_address}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <Button variant="outline" size="sm" onClick={handleDeclineDispatch}>Decline</Button>
                    <Button variant="primary" size="sm" style={{ flex: 1 }} onClick={handleAcceptDispatch}>Accept Ride</Button>
                  </div>
                </Card>
              )}

              {driverActiveTrip && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Badge status={driverActiveTrip.status} />
                  {driverActiveTrip.status === 'DRIVER_ASSIGNED' && (
                    <Button variant="primary" fullWidth onClick={() => handleAdvanceStatus('DRIVER_ARRIVING')}>1. Start Navigation</Button>
                  )}
                  {driverActiveTrip.status === 'DRIVER_ARRIVING' && (
                    <Button variant="accent" fullWidth onClick={() => handleAdvanceStatus('DRIVER_AT_PICKUP')}>2. Arrived at Pickup</Button>
                  )}
                  {driverActiveTrip.status === 'DRIVER_AT_PICKUP' && (
                    <Button variant="primary" fullWidth onClick={() => handleAdvanceStatus('TRIP_STARTED')}>3. Start Trip</Button>
                  )}
                  {driverActiveTrip.status === 'TRIP_STARTED' && (
                    <Button variant="primary" fullWidth style={{ backgroundColor: '#16A34A' }} onClick={() => handleAdvanceStatus('TRIP_COMPLETED')}>4. Complete Trip</Button>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* STANDALONE ADMIN VIEW */}
        {activeTab === 'admin' && (
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <Card variant="elevated" padding="lg">
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '20px' }}>
                Live Operations Portal
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <Card variant="flat" padding="md">
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Online Drivers</span>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#16A34A' }}>{metrics.onlineDriversCount}</h3>
                </Card>
                <Card variant="flat" padding="md">
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Active Trips</span>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#2563EB' }}>{metrics.activeTripsCount}</h3>
                </Card>
                <Card variant="flat" padding="md">
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Gross Value</span>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>{formatKes(metrics.grossRideValueKes)}</h3>
                </Card>
                <Card variant="flat" padding="md">
                  <span style={{ fontSize: '12px', color: '#92400E' }}>Platform Net</span>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#92400E' }}>{formatKes(metrics.platformCommissionKes)}</h3>
                </Card>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>Trips Log</h3>
              {metrics.trips.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#94A3B8' }}>No trips recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {metrics.trips.map((t) => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px', fontSize: '13px' }}>
                      <span>{t.pickup_address} → {t.destination_address}</span>
                      <Badge status={t.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
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
            How was your trip with Samuel Mwangi?
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
