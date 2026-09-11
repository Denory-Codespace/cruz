import React from 'react';
import type { Metadata } from 'next';
import '@cruz/ui/src/styles/tokens.css';

export const metadata: Metadata = {
  title: 'Cruz — Modern Ride-Hailing in Kenya',
  description: 'Fast, reliable, and transparent mobility across Nairobi and beyond.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
