import { Metadata } from 'next';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { TailwindIndicator } from '@/components/tailwind-indicator';
import { ThemeProvider } from '@/components/theme-provider';
import { Geologica, Crimson_Text } from 'next/font/google';
import type { Viewport } from 'next';
import { TRPCReactProvider } from '@/trpc/react';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0b1d' }
  ]
};

import '@/styles/globals.css';

const geologica = Geologica({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-geologica',
  display: 'swap',
  style: 'normal',
  // Next/font fallback metrics can fail for some families on build.
  // We explicitly disable fallback adjustment for reliability.
  adjustFontFallback: false
});

const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-crimson-text',
  display: 'swap',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: [
    'HIPAA compliance',
    'HIPAA risk assessment',
    'healthcare compliance software',
    'private practice HIPAA',
    'BAA tracker',
    'HIPAA policies',
    'breach notification',
    'OCR audit'
  ],
  authors: [{ name: 'HIPAA Hub Health, Inc.' }],
  creator: 'HIPAA Hub',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    creator: '@hipaahub',
  },
  icons: {
    icon: '/images/FAVICON.png',
    shortcut: '/images/FAVICON.png',
    apple: '/images/FAVICON.png'
  },
  // manifest: '/site.webmanifest' // Commented out to avoid CORS issues in development
};

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={cn(
          'min-h-screen bg-background antialiased flex flex-col overflow-x-hidden',
          geologica.variable,
          crimsonText.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster />
          <SonnerToaster />
          {/* <TailwindIndicator /> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
