import { Metadata } from 'next';
import { Inter, Cabinet_Grotesk } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cabinetGrotesk = Cabinet_Grotesk({
  subsets: ['latin'],
  variable: '--font-cabinet-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'GREIA - Life\'s Operating System',
    template: '%s | GREIA',
  },
  description: 'Your unified platform for Properties, Services, Leisure, and Networking.',
  keywords: [
    'property management',
    'real estate',
    'services marketplace',
    'leisure activities',
    'professional networking',
    'lifestyle platform',
  ],
  authors: [{ name: 'GREIA' }],
  creator: 'GREIA',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://greia.com',
    title: 'GREIA - Life\'s Operating System',
    description: 'Your unified platform for Properties, Services, Leisure, and Networking.',
    siteName: 'GREIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GREIA - Life\'s Operating System',
    description: 'Your unified platform for Properties, Services, Leisure, and Networking.',
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

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} ${cabinetGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Header user={session?.user} />
            
            <main className="flex-1">
              {children}
            </main>
            
            <Footer />
          </div>
          
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}