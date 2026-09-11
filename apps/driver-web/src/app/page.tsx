'use client';

import React, { useState, useEffect } from 'react';
import type { Driver, DriverDispatch, RideRequest, RideRequestStatus } from '@cruz/types';
import { Navbar, Button, Card, Badge, Modal, CruzMap, Input } from '@cruz/ui';
import { formatKes, formatDateTime } from '@cruz/utils';
import { driverService, mockStore } from '@cruz/api-client';

export default function DriverApp() {
  const driverId = 'usr-driver-1';
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'onboarding'>('console');
  const [driver, setDriver] = useState<Driver | null>(null);
  const [activeTrip, setActiveTrip] = useState<RideRequest | null>(null);
  const [incomingDispatch, setIncomingDispatch] = useState<DriverDispatch | null>(null);
  const [walletData, setWalletData] = useState(driverService.getDriverWallet(driverId));

  // Onboarding form state
  const [onboardFullName, setOnboardFullName] = useState('Samuel Mwangi');
  const [onboardNationalId, setOnboardNationalId] = useState('12345678');
  const [onboardLicense, setOnboardLicense] = useState('DL-987654');
  const [onboardMake, setOnboardMake] = useState('Toyota');
  const [onboardModel, setOnboardModel] = useState('Vitz');
  const [onboardPlate, setOnboardPlate] = useState('KDA 123X');
  const [onboardSuccess, setOnboardSuccess] = useState(false);

  // Sync with reactive cross-tab mock store
  const syncState = () => {
    const state = mockStore.getState();
    const d = state.drivers.find((item) => item.id === driverId);
    if (d) setDriver({ ...d });

    const trip = state.trips.find(
      (t) => t.driver_id === driverId && t.status !== 'TRIP_COMPLETED' && t.status !== 'CANCELLED'
    );
    setActiveTrip(trip ? { ...trip } : null);

    const dispatch = state.dispatches.find((dp) => dp.driver_id === driverId && dp.status === 'OFFERED');
    setIncomingDispatch(dispatch ? { ...dispatch } : null);

    setWalletData(driverService.getDriverWallet(driverId));
  };

  useEffect(() => {
    setMounted(true);
    syncState();
    const unsubscribe = mockStore.subscribe(syncState);
    return unsubscribe;
  }, []);

  const handleToggleOnline = () => {
    if (!driver) return;
    const nextStatus = driver.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    driverService.setAvailability(driverId, nextStatus === 'ONLINE', nextStatus);
  };

  const handleAcceptDispatch = () => {
    if (incomingDispatch) {
      const result = driverService.acceptDispatch(incomingDispatch.id, driverId);
      if (result.success && result.trip) {
        setActiveTrip(result.trip);
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
    if (activeTrip) {
      const res = driverService.advanceTripStatus(activeTrip.id, nextStatus, driverId);
      if (res.success && res.trip) {
        setActiveTrip(res.trip.status === 'TRIP_COMPLETED' ? null : res.trip);
      }
    }
  };

  const handleSaveOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardSuccess(true);
    setTimeout(() => setOnboardSuccess(false), 3000);
  };

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#2563EB', fontWeight: 700 }}>Loading Cruz Driver Console...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        appName="Driver Web"
        userName="Samuel Mwangi"
        userRole="APPROVED DRIVER"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="http://localhost:3000" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm">Studio Demo</Button>
            </a>
            <a href="http://localhost:3001" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="sm">Passenger App</Button>
            </a>
          </div>
        }
      />

      <main style={{ flex: 1, padding: '24px 16px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        {/* Tab switcher: Active Console vs Vehicle & Onboarding */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('console')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              backgroundColor: activeTab === 'console' ? '#2563EB' : '#E2E8F0',
              color: activeTab === 'console' ? '#FFFFFF' : '#475569',
            }}
          >
            🚗 Live Drive Console
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              backgroundColor: activeTab === 'onboarding' ? '#2563EB' : '#E2E8F0',
              color: activeTab === 'onboarding' ? '#FFFFFF' : '#475569',
            }}
          >
            📄 Vehicle & Documents
          </button>
        </div>

        {activeTab === 'console' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Live Map */}
            <CruzMap
              pickup={activeTrip ? { lat: activeTrip.pickup_lat, lng: activeTrip.pickup_lng } : { lat: -1.2683, lng: 36.8111 }}
              destination={activeTrip ? { lat: activeTrip.destination_lat, lng: activeTrip.destination_lng } : { lat: -1.2864, lng: 36.8172 }}
              driverLocation={{ lat: -1.2683, lng: 36.8111 }}
              pickupLabel={activeTrip ? activeTrip.pickup_address.split(',')[0] : 'Westlands'}
              destinationLabel={activeTrip ? activeTrip.destination_address.split(',')[0] : 'CBD'}
              height="200px"
            />

            {/* Driver Status Card */}
            <Card variant="elevated" padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Driver Status
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: driver?.status === 'ONLINE' ? '#16A34A' : driver?.status === 'IN_TRIP' ? '#2563EB' : '#94A3B8',
                      }}
                    />
                    <strong style={{ fontSize: '18px', color: '#0F172A' }}>
                      {driver?.status || 'OFFLINE'}
                    </strong>
                  </div>
                </div>

                {driver?.status !== 'IN_TRIP' && (
                  <Button
                    variant={driver?.status === 'ONLINE' ? 'danger' : 'accent'}
                    size="md"
                    onClick={handleToggleOnline}
                  >
                    {driver?.status === 'ONLINE' ? 'Go Offline' : 'Go Online'}
                  </Button>
                )}
              </div>
            </Card>

            {/* Active Trip Execution Card */}
            {activeTrip && (
              <Card variant="highlight" padding="lg">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                    Active Trip
                  </h3>
                  <Badge status={activeTrip.status} size="sm" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', fontSize: '14px' }}>
                  <div>
                    <span style={{ color: '#64748B' }}>Passenger:</span>{' '}
                    <strong>{activeTrip.passenger?.full_name || 'David Kamau'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#2563EB', fontWeight: 700 }}>● Pickup:</span>{' '}
                    {activeTrip.pickup_address}
                  </div>
                  <div>
                    <span style={{ color: '#16A34A', fontWeight: 700 }}>■ Drop-off:</span>{' '}
                    {activeTrip.destination_address}
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Est. Fare:</span>{' '}
                    <strong style={{ color: '#0F172A' }}>{formatKes(activeTrip.estimated_fare_kes)}</strong>
                  </div>
                </div>

                {/* Step progression actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeTrip.status === 'DRIVER_ASSIGNED' && (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={() => handleAdvanceStatus('DRIVER_ARRIVING')}
                    >
                      1. Tap to Start Navigating to Pickup
                    </Button>
                  )}

                  {activeTrip.status === 'DRIVER_ARRIVING' && (
                    <Button
                      variant="accent"
                      size="lg"
                      fullWidth
                      onClick={() => handleAdvanceStatus('DRIVER_AT_PICKUP')}
                    >
                      2. Arrived at Pickup Location
                    </Button>
                  )}

                  {activeTrip.status === 'DRIVER_AT_PICKUP' && (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={() => handleAdvanceStatus('TRIP_STARTED')}
                    >
                      3. Passenger Onboard — Start Trip
                    </Button>
                  )}

                  {activeTrip.status === 'TRIP_STARTED' && (
                    <Button
                      variant="primary"
                      size="lg"
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

            {/* Driver Wallet & Earnings */}
            <Card variant="elevated" padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Wallet Balance
                  </span>
                  <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                    {formatKes(walletData.wallet?.balance_kes || 0)}
                  </h2>
                </div>
                <Badge variant="green" size="sm">Active Ledger</Badge>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                Recent Ledger Transactions
              </h4>

              {walletData.transactions.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#94A3B8' }}>No transactions recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {walletData.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 10px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#0F172A', display: 'block' }}>
                          {tx.type.replace('_', ' ')}
                        </strong>
                        <span suppressHydrationWarning style={{ color: '#94A3B8', fontSize: '11px' }}>
                          {formatDateTime(tx.created_at)}
                        </span>
                      </div>
                      <strong style={{ color: '#16A34A' }}>
                        +{formatKes(tx.amount_kes)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Vehicle & Onboarding Tab */}
        {activeTab === 'onboarding' && (
          <Card variant="elevated" padding="lg">
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
              Driver Verification & Vehicle Information
            </h3>

            {onboardSuccess && (
              <div style={{ backgroundColor: '#DDF5E3', color: '#15803D', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontWeight: 600, fontSize: '13px' }}>
                ✓ Driver and Vehicle details updated successfully!
              </div>
            )}

            <form onSubmit={handleSaveOnboarding} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input label="Full Legal Name" value={onboardFullName} onChange={(e) => setOnboardFullName(e.target.value)} />
              <Input label="National ID Number" value={onboardNationalId} onChange={(e) => setOnboardNationalId(e.target.value)} />
              <Input label="Driving License Number" value={onboardLicense} onChange={(e) => setOnboardLicense(e.target.value)} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input label="Vehicle Make" value={onboardMake} onChange={(e) => setOnboardMake(e.target.value)} />
                <Input label="Vehicle Model" value={onboardModel} onChange={(e) => setOnboardModel(e.target.value)} />
              </div>

              <Input label="License Plate Number" value={onboardPlate} onChange={(e) => setOnboardPlate(e.target.value)} />

              <Button variant="primary" size="md" type="submit" style={{ marginTop: '10px' }}>
                Save & Update Details
              </Button>
            </form>
          </Card>
        )}
      </main>

      {/* Incoming Dispatch Offer Modal */}
      <Modal
        isOpen={Boolean(incomingDispatch)}
        onClose={handleDeclineDispatch}
        title="🔔 Incoming Ride Dispatch"
        footer={
          <>
            <Button variant="outline" onClick={handleDeclineDispatch}>
              Decline
            </Button>
            <Button variant="primary" onClick={handleAcceptDispatch}>
              Accept Ride
            </Button>
          </>
        }
      >
        {incomingDispatch && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                backgroundColor: '#DCEEFF',
                padding: '12px',
                borderRadius: '8px',
                color: '#1D4ED8',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              ⏱️ Dispatch offer expires in 60 seconds
            </div>

            <div>
              <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>PICKUP</span>
              <strong style={{ fontSize: '15px', color: '#0F172A' }}>
                {incomingDispatch.trip?.pickup_address}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>DESTINATION</span>
              <strong style={{ fontSize: '15px', color: '#0F172A' }}>
                {incomingDispatch.trip?.destination_address}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Est. Distance</span>
                <strong style={{ display: 'block', color: '#0F172A' }}>
                  {incomingDispatch.trip?.estimated_distance_km} km
                </strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Est. Total Fare</span>
                <strong style={{ display: 'block', color: '#16A34A', fontSize: '16px' }}>
                  {formatKes(incomingDispatch.trip?.estimated_fare_kes || 0)}
                </strong>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
