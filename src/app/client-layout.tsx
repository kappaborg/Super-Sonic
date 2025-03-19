'use client';

import { Toaster } from '@/components/ui/Toaster';
import { ToastProvider } from '@/components/ui/use-toast';
import { SessionProvider } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { initWebVitals } from '@/utils/webVitalsReporter';
import React, { useEffect } from 'react';

// Import the progress bar at the client level
const TopProgressBar = dynamic(
  () => import('../components/ui/TopProgressBar'),
  { ssr: false }
);

// Configure fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // Don't show layout for auth pages
  const isAuthPage = pathname?.startsWith('/auth');

  // Tarayıcı tarafında Web Vitals izlemeyi başlat
  useEffect(() => {
    initWebVitals();

    // Service Worker kaydı
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      import('@/utils/serviceWorkerRegistration')
        .then(({ register }) => {
          register({
            onSuccess: () => console.log('Service worker başarıyla kaydedildi'),
            onUpdate: (registration) => {
              console.log('Yeni içerik mevcut; lütfen sayfayı yenileyin');
              // Service worker güncelleme bildirimini göster
              const updateNotification = document.getElementById('sw-update-notification');
              if (updateNotification) {
                updateNotification.classList.remove('hidden');

                // Yenile butonuna tıklandığında
                const refreshButton = document.getElementById('sw-refresh-button');
                if (refreshButton) {
                  refreshButton.addEventListener('click', () => {
                    if (registration.waiting) {
                      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    }
                    window.location.reload();
                  });
                }
              }
            }
          });
        })
        .catch(err => console.error('Service worker kaydı sırasında hata:', err));
    }
  }, []);

  return (
    <SessionProvider>
      <ToastProvider>
        <div className={`${inter.variable} font-sans min-h-screen flex flex-col`}>
          <TopProgressBar />

          {!isAuthPage && <Navbar />}

          <main className="flex-grow">
            {children}
          </main>

          {!isAuthPage && <Footer />}

          <Toaster />

          {/* Scripts added to body, not head */}
          <script
            defer
            data-domain="secure-sonic.com"
            src="https://plausible.io/js/script.js"
          ></script>

          {/* Include Google Analytics */}
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          ></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `,
            }}
          ></script>
        </div>
      </ToastProvider>
    </SessionProvider>
  );
} 