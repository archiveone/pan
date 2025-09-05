import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'GREIA - Life\'s Operating System',
    template: '%s | GREIA',
  },
  description: 'Your unified platform for properties, services, leisure, and networking.',
  keywords: [
    'property marketplace',
    'real estate',
    'services platform',
    'leisure activities',
    'social networking',
    'CRM system',
    'property management',
    'rental marketplace',
    'event booking',
    'professional services',
  ],
  authors: [
    {
      name: 'GREIA Team',
      url: 'https://greia.com',
    },
  ],
  creator: 'GREIA',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://greia.com',
    title: 'GREIA - Life\'s Operating System',
    description: 'Your unified platform for properties, services, leisure, and networking.',
    siteName: 'GREIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GREIA - Life\'s Operating System',
    description: 'Your unified platform for properties, services, leisure, and networking.',
    creator: '@greia',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}