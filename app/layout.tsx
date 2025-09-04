import './globals.css';
import type { Metadata } from 'next';
import { Inter, SF_Pro_Display } from 'next/font/google';
import Providers from './providers';
import Navbar from '@/components/navigation/navbar';

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sfProDisplay.variable}`}>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            {/* Footer will go here */}
          </div>
        </Providers>
      </body>
    </html>
  );
}