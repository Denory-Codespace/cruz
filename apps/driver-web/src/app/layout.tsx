import React from 'react';
import type { Metadata } from 'next';
import '@cruz/ui/src/styles/tokens.css';

export const metadata: Metadata = {
  title: 'Cruz — Driver Console & Operations',
  description: 'Manage dispatches, active trips, and wallet earnings with Cruz.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
