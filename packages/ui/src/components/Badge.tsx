import React from 'react';
import type { RideRequestStatus } from '@cruz/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'yellow' | 'green' | 'red' | 'gray' | 'purple';
  status?: RideRequestStatus;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  size = 'md',
  style,
  ...props
}) => {
  const resolveVariant = (): 'blue' | 'yellow' | 'green' | 'red' | 'gray' => {
    if (variant) return variant as any;
    if (status) {
      switch (status) {
        case 'REQUESTED':
        case 'SEARCHING':
          return 'yellow';
        case 'DRIVER_ASSIGNED':
        case 'DRIVER_ARRIVING':
        case 'DRIVER_AT_PICKUP':
        case 'TRIP_STARTED':
          return 'blue';
        case 'TRIP_COMPLETED':
          return 'green';
        case 'CANCELLED':
          return 'red';
      }
    }
    return 'gray';
  };

  const currentVariant = resolveVariant();

  const getVariantStyles = (): React.CSSProperties => {
    switch (currentVariant) {
      case 'blue':
        return { backgroundColor: '#DCEEFF', color: '#1D4ED8', border: '1px solid #B8DBFF' };
      case 'yellow':
        return { backgroundColor: '#FFF1B8', color: '#92400E', border: '1px solid #FEE380' };
      case 'green':
        return { backgroundColor: '#DDF5E3', color: '#15803D', border: '1px solid #B9ECC5' };
      case 'red':
        return { backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' };
      case 'gray':
        return { backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' };
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 600,
        borderRadius: '9999px',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        fontSize: size === 'sm' ? '12px' : '13px',
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {children || status?.replace('_', ' ')}
    </span>
  );
};
