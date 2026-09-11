import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id,
  style,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#0F172A',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: '15px',
          borderRadius: '10px',
          border: error ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color 0.15s ease',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 500 }}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span style={{ fontSize: '12px', color: '#64748B' }}>{helperText}</span>
      )}
    </div>
  );
};
