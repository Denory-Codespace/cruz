import React from 'react';
import { Navbar, Button, Card } from '@cruz/ui';

export default function MarketingHomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        appName="Cruz"
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href="http://localhost:3001" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm">Passenger Web</Button>
            </a>
            <a href="http://localhost:3002" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="sm">Driver Web</Button>
            </a>
            <a href="http://localhost:3003" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="sm">Live Ops Portal</Button>
            </a>
          </div>
        }
      />

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section
          style={{
            background: 'linear-gradient(135deg, #F0F7FF 0%, #FFFDF0 50%, #F2FBF5 100%)',
            padding: '80px 24px',
            textAlign: 'center',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFF1B8',
                color: '#92400E',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 700,
                marginBottom: '20px',
              }}
            >
              <span>🇰🇪</span> Next-Gen Ride-Hailing Built for Nairobi
            </div>

            <h1
              style={{
                fontSize: '48px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-1px',
                lineHeight: 1.15,
                marginBottom: '20px',
              }}
            >
              Rides you can trust. <br />
              <span style={{ color: '#2563EB' }}>Fares that make sense.</span>
            </h1>

            <p
              style={{
                fontSize: '19px',
                color: '#475569',
                lineHeight: 1.6,
                marginBottom: '36px',
                maxWidth: '640px',
                margin: '0 auto 36px',
              }}
            >
              Experience seamless, safe, and transparent mobility across Nairobi. Zero hidden fees, fair driver earnings, and instant matching.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <a href="http://localhost:3001" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="lg">
                  Request a Ride
                </Button>
              </a>
              <a href="http://localhost:3002" style={{ textDecoration: 'none' }}>
                <Button variant="accent" size="lg">
                  Drive with Cruz
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Value Props Section */}
        <section style={{ padding: '70px 24px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A' }}>
              Why Move with Cruz?
            </h2>
            <p style={{ fontSize: '16px', color: '#64748B', marginTop: '8px' }}>
              Designed from the ground up for riders, drivers, and fleet partners.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            <Card variant="highlight" padding="lg">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#DCEEFF',
                  color: '#1D4ED8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  marginBottom: '16px',
                }}
              >
                ⚡
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Instant Dispatch
              </h3>
              <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.5 }}>
                Our proximity dispatch engine connects you with vetted drivers in seconds with accurate ETAs.
              </p>
            </Card>

            <Card variant="highlight" padding="lg" style={{ backgroundColor: '#FFFDF0', borderColor: '#FEE380' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#FFF1B8',
                  color: '#92400E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  marginBottom: '16px',
                }}
              >
                💰
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Fair & Transparent
              </h3>
              <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.5 }}>
                Fixed per-km and per-minute KES rates with clear receipts and zero surprise surges.
              </p>
            </Card>

            <Card variant="highlight" padding="lg" style={{ backgroundColor: '#F2FBF5', borderColor: '#B9ECC5' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#DDF5E3',
                  color: '#15803D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  marginBottom: '16px',
                }}
              >
                🛡️
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Vetted & Secure
              </h3>
              <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.5 }}>
                Every driver undergoes strict identity verification, license validation, and vehicle inspection.
              </p>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #E2E8F0',
          padding: '32px 24px',
          backgroundColor: '#FFFFFF',
          textAlign: 'center',
          color: '#64748B',
          fontSize: '14px',
        }}
      >
        <p>© 2026 Cruz. All rights reserved. Nairobi, Kenya.</p>
      </footer>
    </div>
  );
}
