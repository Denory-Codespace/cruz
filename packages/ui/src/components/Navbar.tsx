import React from 'react';

export interface NavbarProps {
  appName?: string;
  userRole?: string;
  userName?: string;
  onLogout?: () => void;
  actions?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({
  appName = 'Cruz',
  userRole,
  userName,
  onLogout,
  actions,
}) => {
  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '18px',
              padding: '4px 10px',
              borderRadius: '8px',
              letterSpacing: '-0.5px',
            }}
          >
            CRUZ
          </span>
          {appName !== 'Cruz' && (
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>
              {appName}
            </span>
          )}
        </a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {actions}
        {userName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                {userName}
              </div>
              {userRole && (
                <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>
                  {userRole}
                </div>
              )}
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
