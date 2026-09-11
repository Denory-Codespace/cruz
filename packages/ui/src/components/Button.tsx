import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#2563EB',
          color: '#FFFFFF',
          border: '1px solid #1D4ED8',
        };
      case 'secondary':
        return {
          backgroundColor: '#DCEEFF',
          color: '#1D4ED8',
          border: '1px solid #B8DBFF',
        };
      case 'accent':
        return {
          backgroundColor: '#FFF1B8',
          color: '#92400E',
          border: '1px solid #FEE380',
        };
      case 'outline':
        return {
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          border: '1px solid #E2E8F0',
        };
      case 'danger':
        return {
          backgroundColor: '#EF4444',
          color: '#FFFFFF',
          border: '1px solid #DC2626',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: '#475569',
          border: '1px solid transparent',
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '13px', borderRadius: '8px' };
      case 'md':
        return { padding: '10px 18px', fontSize: '15px', borderRadius: '10px' };
      case 'lg':
        return { padding: '14px 24px', fontSize: '16px', borderRadius: '12px' };
    }
  };

  const combinedStyles: React.CSSProperties = {
    fontFamily: 'inherit',
    fontWeight: 600,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.15s ease-in-out',
    width: fullWidth ? '100%' : 'auto',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  return (
    <button disabled={disabled || isLoading} style={combinedStyles} className={className} {...props}>
      {isLoading && (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  );
};
