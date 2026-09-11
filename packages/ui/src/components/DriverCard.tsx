import React from 'react';
import type { Driver, Vehicle } from '@cruz/types';
import { Card } from './Card';
import { Badge } from './Badge';

export interface DriverCardProps {
  driver: Driver;
  vehicle?: Vehicle | null;
  etaMins?: number;
}

export const DriverCard: React.FC<DriverCardProps> = ({
  driver,
  vehicle,
  etaMins,
}) => {
  return (
    <Card variant="elevated" padding="md">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#DCEEFF',
              color: '#1D4ED8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '18px',
            }}
          >
            {driver.user_profile?.full_name?.charAt(0) || 'D'}
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
              {driver.user_profile?.full_name || 'Assigned Driver'}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ color: '#D97706', fontSize: '13px', fontWeight: 700 }}>★ {driver.rating_avg.toFixed(1)}</span>
              <span style={{ color: '#94A3B8', fontSize: '12px' }}>({driver.rating_count} rides)</span>
            </div>
          </div>
        </div>

        {etaMins !== undefined && (
          <div style={{ textAlign: 'right' }}>
            <Badge variant="green" size="sm">Arriving in {etaMins}m</Badge>
          </div>
        )}
      </div>

      {vehicle && (
        <div
          style={{
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
          }}
        >
          <div>
            <span style={{ fontWeight: 600, color: '#0F172A' }}>
              {vehicle.make} {vehicle.model}
            </span>
            <span style={{ color: '#64748B', marginLeft: '6px' }}>({vehicle.color})</span>
          </div>
          <div
            style={{
              backgroundColor: '#FFF1B8',
              color: '#92400E',
              padding: '3px 8px',
              borderRadius: '6px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              fontSize: '13px',
            }}
          >
            {vehicle.license_plate}
          </div>
        </div>
      )}
    </Card>
  );
};
