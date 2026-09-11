import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'flat' | 'outline' | 'highlight';
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  style,
  className = '',
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
        };
      case 'flat':
        return {
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
        };
      case 'outline':
        return {
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
        };
      case 'highlight':
        return {
          backgroundColor: '#F2F8FF',
          border: '1px solid #B8DBFF',
        };
    }
  };

  const getPaddingStyles = (): React.CSSProperties => {
    switch (padding) {
      case 'sm':
        return { padding: '12px' };
      case 'md':
        return { padding: '20px' };
      case 'lg':
        return { padding: '28px' };
      case 'none':
        return { padding: '0' };
    }
  };

  return (
    <div
      style={{
        borderRadius: '16px',
        ...getVariantStyles(),
        ...getPaddingStyles(),
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};
