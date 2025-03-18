import AuthProvider from '@/providers/AuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import '@/styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import ClientLayout from './client-layout';

// Font optimizasyonu için display swap ile yükleme
const inter = Inter({ 
  subsets: ['latin'], 
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'SecureSonic',
  description: 'Secure voice authentication for online meetings',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased">
        <AuthProvider>
          <ToastProvider>
            <ClientLayout>{children}</ClientLayout>
          </ToastProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
} 