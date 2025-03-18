import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'SecureSonic | Güvenli Ses Doğrulama Platformu',
    template: '%s | SecureSonic'
  },
  description: 'SecureSonic, ses doğrulama teknolojileri ile güvenliği en üst düzeye çıkaran bir B2B platformdur.',
  keywords: ['ses doğrulama', 'güvenlik', 'ses analizi', 'biometrik doğrulama', 'yapay zeka'],
  authors: [{ name: 'SecureSonic Team', url: 'https://securesonic.com' }],
  creator: 'SecureSonic',
  publisher: 'SecureSonic Inc.',
  metadataBase: new URL('https://securesonic.com'),
  openGraph: {
    title: 'SecureSonic | Güvenli Ses Doğrulama Platformu',
    description: 'SecureSonic, ses doğrulama teknolojileri ile güvenliği en üst düzeye çıkaran bir B2B platformdur.',
    url: 'https://securesonic.com',
    siteName: 'SecureSonic',
    images: [
      {
        url: 'https://securesonic.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SecureSonic Logo'
      }
    ],
    locale: 'tr_TR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SecureSonic | Güvenli Ses Doğrulama Platformu',
    description: 'SecureSonic, ses doğrulama teknolojileri ile güvenliği en üst düzeye çıkaran bir B2B platformdur.',
    images: ['https://securesonic.com/twitter-image.jpg'],
    creator: '@securesonic',
    site: '@securesonic'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://securesonic.com',
    languages: {
      'en-US': 'https://securesonic.com/en-US',
      'tr-TR': 'https://securesonic.com'
    }
  }
}; 