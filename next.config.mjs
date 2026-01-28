import createMDX from 'fumadocs-mdx/config';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Webpack configuration to handle node: protocol
  webpack: (config, { isServer }) => {
    // Resolve node: protocol imports
    if (isServer) {
      // Server-side: resolve to native Node.js modules
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'node:path': 'path',
        'node:fs': 'fs',
        'node:os': 'os',
        'node:url': 'url',
        'node:util': 'util',
        'node:crypto': 'crypto',
      };
    } else {
      // Client-side: these should not be bundled, provide fallbacks
      try {
        const pathBrowserify = require.resolve('path-browserify');
        config.resolve.alias = {
          ...(config.resolve.alias || {}),
          'node:path': pathBrowserify,
          'node:fs': false,
          'node:os': false,
          'node:url': false,
          'node:util': false,
          'node:crypto': false,
        };
        
        config.resolve.fallback = {
          ...(config.resolve.fallback || {}),
          fs: false,
          path: pathBrowserify,
          os: false,
          crypto: false,
          stream: false,
          buffer: false,
          util: false,
          url: false,
        };
      } catch (e) {
        // If path-browserify is not found, just set to false
        config.resolve.alias = {
          ...(config.resolve.alias || {}),
          'node:path': false,
          'node:fs': false,
          'node:os': false,
          'node:url': false,
          'node:util': false,
          'node:crypto': false,
        };
        
        config.resolve.fallback = {
          ...(config.resolve.fallback || {}),
          fs: false,
          path: false,
          os: false,
          crypto: false,
          stream: false,
          buffer: false,
          util: false,
          url: false,
        };
      }
    }
    
    return config;
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', '@supabase/supabase-js'],
    optimizeCss: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'http', 
        hostname: '127.0.0.1', 
        port: '64321',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'llmgwifgtszjgjlzlwjq.supabase.co',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**'
      }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Headers for caching and security
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return [
      {
        source: '/dashboard/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/blog/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // HSTS only in production (HTTPS required)
          ...(isProduction ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          }] : []),
          // CSP - adjust based on your needs
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.vercel-insights.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.stripe.com https://*.stripe.com https://*.sentry.io https://vitals.vercel-insights.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withMDX(config);
