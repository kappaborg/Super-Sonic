/** @type {import('next').NextConfig} */

const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com *.vercel-scripts.com https://va.vercel-scripts.com https://www.google-analytics.com https://cdn.jsdelivr.net vercel.live;
  child-src 'self';
  style-src 'self' 'unsafe-inline' *.googleapis.com;
  img-src 'self' blob: data: *.googleapis.com ui-avatars.com;
  font-src 'self' data: *.googleapis.com;
  connect-src 'self' blob: *.googleapis.com *.vercel-scripts.com https://va.vercel-scripts.com vitals.vercel-insights.com analytics.google.com;
  media-src 'self' blob:;
  frame-src 'self' vercel.live;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=*, geolocation=(self), interest-cohort=()',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['secure-sonic.com', 'ui-avatars.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      moment: 'date-fns',
    };

    if (isServer) {
      config.externals = [
        ...config.externals,
        'react-speech-recognition',
        'audiomotion-analyzer',
      ];
    }

    return config;
  },

  assetPrefix: process.env.NEXT_PUBLIC_CDN_URL || '',

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  output: 'standalone',

  productionBrowserSourceMaps: false,

  compiler: {
    // styledComponents: true,
  },

  // For hydration error fixes
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
};

module.exports = withBundleAnalyzer(nextConfig); 