'use client';

import React, { useState, useEffect } from 'react';
import type { Driver, DriverDispatch, RideRequest, RideRequestStatus } from '@cruz/types';
import { Navbar, Button, Card, Badge, Modal } from '@cruz/ui';
import { formatKes, formatDateTime } from '@cruz/utils';
import { driverService, mockStore } from '@cruz/api-client';

export default function DriverApp() {
  const driverId = 'usr-driver-1';
  const [mounted, setMounted] = useState(false);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [activeTrip, setActiveTrip] = useState<RideRequest | null>(null);
  const [incomingDispatch, setIncomingDispatch] = useState<DriverDispatch | null>(null);
  const [walletData, setWalletData] = useState(driverService.getDriverWallet(driverId));

  // Sync with cross-tab mock store
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
        appName="Driver"
        userName="Samuel Mwangi"
        userRole="APPROVED DRIVER"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="http://localhost:3001" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm">Open Passenger App</Button>
            </a>
            <a href="http://localhost:3003" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="sm">Open Live Ops</Button>
            </a>
          </div>
        }
      />

      <main style={{ flex: 1, padding: '24px 16px', maxWidth: '580px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Driver Status Card */}
          <Card variant="elevated" padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                  Operational Status
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
