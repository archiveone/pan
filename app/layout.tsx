import './globals.css';
import type { Metadata } from 'next';
import { Inter, SF_Pro_Display } from 'next/font/google';
import Providers from './providers';
import Navbar from '@/components/navigation/navbar';
import Footer from '@/components/navigation/footer';

// Inter for body text
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

// SF Pro Display for headings (closest to Apple's font)
const sfProDisplay = SF_Pro_Display({ 
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'GREIA - Life\'s Operating System',
  description: 'One super-app for lifestyle, property, and networking',
  icons: {
    icon: '/favicon.ico',
  },
  metadataBase: new URL('https://greia.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://greia.com',
    title: 'GREIA - Life\'s Operating System',
    description: 'One super-app for lifestyle, property, and networking',
    siteName: 'GREIA',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GREIA - Life\'s Operating System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GREIA - Life\'s Operating System',
    description: 'One super-app for lifestyle, property, and networking',
    images: ['/og-image.png'],
    creator: '@greia',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${sfProDisplay.variable}`}
      suppressHydrationWarning
    >
      <body 
        className={`${inter.className} min-h-screen bg-background antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}