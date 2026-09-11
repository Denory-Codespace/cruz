'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, Button, Card, Badge } from '@cruz/ui';
import { formatKes, formatDateTime } from '@cruz/utils';
import { adminService, mockStore } from '@cruz/api-client';

export default function AdminPortal() {
  const [mounted, setMounted] = useState(false);
  const [metrics, setMetrics] = useState(adminService.getOperationalMetrics());

  const refresh = () => {
    setMetrics(adminService.getOperationalMetrics());
  };

  useEffect(() => {
    setMounted(true);
    refresh();
    const unsubscribe = mockStore.subscribe(refresh);
    return unsubscribe;
  }, []);

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#2563EB', fontWeight: 700 }}>Loading Live Ops Portal...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
      <Navbar
        appName="Live Ops & Operations Portal"
        userName="Denzel"
        userRole="SUPER ADMIN"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="http://localhost:3001" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm">Passenger App</Button>
            </a>
            <a href="http://localhost:3002" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="sm">Driver App</Button>
            </a>
          </div>
        }
      />

      <main style={{ flex: 1, padding: '28px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* KPI Metrics Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <Card variant="elevated" padding="md">
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Active Online Drivers</span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>
              {metrics.onlineDriversCount}
            </h2>
          </Card>

          <Card variant="elevated" padding="md">
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Live Active Trips</span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
              {metrics.activeTripsCount}
            </h2>
          </Card>

          <Card variant="elevated" padding="md">
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Gross Ride Value</span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
              {formatKes(metrics.grossRideValueKes)}
            </h2>
          </Card>

          <Card variant="highlight" padding="md" style={{ backgroundColor: '#FFFDF0', borderColor: '#FEE380' }}>
            <span style={{ fontSize: '13px', color: '#92400E', fontWeight: 700 }}>Platform Revenue (15%)</span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#92400E', marginTop: '4px' }}>
              {formatKes(metrics.platformCommissionKes)}
            </h2>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
          {/* Active / Recent Trips Table */}
          <Card variant="elevated" padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                Trips Monitor
              </h3>
              <Badge variant="blue" size="sm">{metrics.trips.length} Total</Badge>
            </div>

            {metrics.trips.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: '14px', padding: '16px 0' }}>
                No active or completed trips in system yet. Request a ride from the Passenger App!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {metrics.trips.map((trip) => (
                  <div
                    key={trip.id}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '13px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Badge status={trip.status} size="sm" />
                        <span suppressHydrationWarning style={{ color: '#64748B' }}>{formatDateTime(trip.created_at)}</span>
                      </div>
                      <div style={{ color: '#0F172A', fontWeight: 600 }}>
                        {trip.pickup_address.split(',')[0]} → {trip.destination_address.split(',')[0]}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#0F172A', fontSize: '15px' }}>
                        {formatKes(trip.actual_fare_kes || trip.estimated_fare_kes)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Drivers List */}
          <Card variant="elevated" padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                Registered Drivers & Fleet
              </h3>
              <Badge variant="green" size="sm">{metrics.drivers.length} Drivers</Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {metrics.drivers.map((drv) => {
                const user = metrics.users.find((u) => u.id === drv.id);
                return (
                  <div
                    key={drv.id}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '13px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>
                        {user?.full_name || 'Driver'}
                      </div>
                      <div style={{ color: '#64748B', marginTop: '2px' }}>
                        ★ {drv.rating_avg.toFixed(1)} ({drv.rating_count} trips) · Plate: {drv.driving_license_number}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Badge variant={drv.status === 'ONLINE' ? 'green' : drv.status === 'IN_TRIP' ? 'blue' : 'gray'} size="sm">
                        {drv.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
