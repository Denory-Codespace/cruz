import React from 'react';
import type { FareCalculationResult } from '@cruz/types';
import { Card } from './Card';
import { formatKes } from '@cruz/utils';

export interface FareCardProps {
  fare: FareCalculationResult;
  distanceKm: number;
  durationMins: number;
  pickupAddress: string;
  destinationAddress: string;
}

export const FareCard: React.FC<FareCardProps> = ({
  fare,
  distanceKm,
  durationMins,
  pickupAddress,
  destinationAddress,
}) => {
  return (
    <Card variant="highlight" padding="md">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Estimated Total Fare
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
            {formatKes(fare.totalFareKes)}
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>Trip Distance</span>
          <strong style={{ fontSize: '14px', color: '#0F172A' }}>{distanceKm} km (~{durationMins} mins)</strong>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #DCEEFF', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <span style={{ color: '#2563EB', fontWeight: 700 }}>●</span>
          <span style={{ color: '#475569' }}><strong>Pickup:</strong> {pickupAddress}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <span style={{ color: '#16A34A', fontWeight: 700 }}>■</span>
          <span style={{ color: '#475569' }}><strong>Drop-off:</strong> {destinationAddress}</span>
        </div>
      </div>
    </Card>
  );
};
