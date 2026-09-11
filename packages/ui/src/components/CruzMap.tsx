import React from 'react';
import type { Coordinates } from '@cruz/types';

export interface CruzMapProps {
  pickup?: Coordinates | null;
  destination?: Coordinates | null;
  driverLocation?: Coordinates | null;
  pickupLabel?: string;
  destinationLabel?: string;
  height?: string;
}

export const CruzMap: React.FC<CruzMapProps> = ({
  pickup = { lat: -1.2618, lng: 36.8044 }, // Westlands default
  destination = { lat: -1.2864, lng: 36.8172 }, // CBD default
  driverLocation,
  pickupLabel = 'Pickup',
  destinationLabel = 'Destination',
  height = '240px',
}) => {
  // Nairobi bounding box reference for projection
  // minLat: -1.33, maxLat: -1.22
  // minLng: 36.75, maxLng: 36.93
  const minLat = -1.33;
  const maxLat = -1.22;
  const minLng = 36.75;
  const maxLng = 36.93;

  const projectToSvg = (coord: Coordinates) => {
    const x = ((coord.lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - coord.lat) / (maxLat - minLat)) * 100;
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  };

  const pSvg = pickup ? projectToSvg(pickup) : { x: 30, y: 35 };
  const dSvg = destination ? projectToSvg(destination) : { x: 65, y: 65 };
  const drvSvg = driverLocation ? projectToSvg(driverLocation) : { x: 40, y: 45 };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid #CBD5E1',
        backgroundColor: '#E2E8F0',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Map Grid / Styled Nairobi Cartography Background */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          background: 'linear-gradient(135deg, #E6F0FA 0%, #EFF6E0 50%, #F5F3E5 100%)',
        }}
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#CBD5E1" strokeWidth="0.5" strokeOpacity="0.6" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Nairobi Main Road Arteries (Waiyaki Way, Uhuru Highway, Mombasa Rd, Ngong Rd) */}
        <path d="M 0,30 Q 30,35 60,60 T 100,90" fill="none" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
        <path d="M 0,30 Q 30,35 60,60 T 100,90" fill="none" stroke="#FDE68A" strokeWidth="6" strokeLinecap="round" />

        <path d="M 40,0 Q 55,40 60,60 T 70,100" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
        <path d="M 40,0 Q 55,40 60,60 T 70,100" fill="none" stroke="#FCD34D" strokeWidth="5" strokeLinecap="round" />

        {/* Route Polyline between Pickup and Destination */}
        <path
          d={`M ${pSvg.x},${pSvg.y} Q ${(pSvg.x + dSvg.x) / 2 + 5},${(pSvg.y + dSvg.y) / 2 - 5} ${dSvg.x},${dSvg.y}`}
          fill="none"
          stroke="#2563EB"
          strokeWidth="3"
          strokeDasharray="4 4"
        />

        {/* Pickup Pin */}
        <g transform={`translate(${pSvg.x}, ${pSvg.y})`}>
          <circle r="8" fill="#2563EB" fillOpacity="0.25">
            <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
        </g>

        {/* Destination Pin */}
        <g transform={`translate(${dSvg.x}, ${dSvg.y})`}>
          <rect x="-5" y="-5" width="10" height="10" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" rx="2" />
        </g>

        {/* Driver Car Icon */}
        {driverLocation && (
          <g transform={`translate(${drvSvg.x}, ${drvSvg.y})`}>
            <circle r="10" fill="#0F172A" />
            <text x="0" y="3" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
              🚗
            </text>
          </g>
        )}
      </svg>

      {/* Map Overlay Badge (Nairobi Live GPS) */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(4px)',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#0F172A',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
        Nairobi Live Map
      </div>

      {/* Map Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(4px)',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 600,
          color: '#475569',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '10px',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#2563EB', fontWeight: 800 }}>●</span> {pickupLabel}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#16A34A', fontWeight: 800 }}>■</span> {destinationLabel}
        </span>
      </div>
    </div>
  );
};
