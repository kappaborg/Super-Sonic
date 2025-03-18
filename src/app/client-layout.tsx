'use client';

import { initWebVitals } from '@/utils/webVitalsReporter';
import Script from 'next/script';
import React, { useEffect } from 'react';
import { Providers } from './providers';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
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
    <>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        
        {/* Preload kritik varlıkları */}
        <link 
          rel="preload" 
          href="/js/critical.js" 
          as="script" 
          fetchPriority="high"
          crossOrigin="anonymous"
        />
        
        {/* Kritik JS'i öncelikli olarak yükleme */}
        <Script 
          src="/js/critical.js" 
          strategy="beforeInteractive" 
        />
        
        {/* İlk render içi gerekli olmayan JS'leri gecikmeli yükleme */}
        <Script 
          src="/js/analytics.js"
          strategy="afterInteractive"
          onLoad={() => {
            console.log('Analytics script yüklendi');
          }}
        />
        
        {/* İçerik görüntülendikten sonra yüklenecek olan scriptler */}
        <Script
          src="https://example.com/third-party.js"
          strategy="lazyOnload"
        />
      </head>

      <Providers>
        {/* Yeni service worker güncellemesi bildirimi */}
        <div id="sw-update-notification" className="hidden fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 border border-primary-500">
          <p className="text-sm mb-2">Yeni bir versiyon mevcut!</p>
          <button 
            id="sw-refresh-button"
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
          >
            Yenile
          </button>
        </div>
        
        {/* Navbar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <a href="/" className="flex items-center space-x-2">
                  <div className="h-10 w-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    SS
                  </div>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">SecureSonic</span>
                </a>
                <nav className="hidden md:flex space-x-8 ml-8">
                  <a href="/features" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Özellikler</a>
                  <a href="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Fiyatlandırma</a>
                  <a href="/about" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Hakkımızda</a>
                  <a href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">İletişim</a>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <a href="/auth/login" className="hidden md:inline-block px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Giriş Yap
                </a>
                <a href="/auth/register" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  Ücretsiz Deneyin
                </a>
                <button className="md:hidden text-gray-700 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1">
          {children}
        </main>
        
        <footer className="bg-gray-100 dark:bg-gray-800 mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} SecureSonic. Tüm hakları saklıdır.
            </div>
          </div>
        </footer>
      </Providers>
    </>
  );
} 