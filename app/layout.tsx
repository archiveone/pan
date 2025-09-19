import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GREIA - Life\'s Operating System',
  description: 'Your unified platform for Properties, Services, Leisure, and Connect',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/greia-logo.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <img
                  src="/greia-logo.png"
                  alt="GREIA"
                  className="h-8 dark:invert"
                />
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/properties" className="text-foreground hover:text-primary">
                  Properties
                </Link>
                <Link href="/services" className="text-foreground hover:text-primary">
                  Services
                </Link>
                <Link href="/leisure" className="text-foreground hover:text-primary">
                  Leisure
                </Link>
                <Link href="/connect" className="text-foreground hover:text-primary">
                  Connect
                </Link>
              </div>

              {/* Auth & Theme */}
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground hover:text-primary"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90"
                >
                  Sign up
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="pt-16 min-h-screen bg-background text-foreground">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-background border-t py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand */}
                <div>
                  <img
                    src="/greia-logo.png"
                    alt="GREIA"
                    className="h-8 mb-4 dark:invert"
                  />
                  <p className="text-sm text-muted-foreground">
                    Life's Operating System - Your unified platform for Properties, Services, Leisure, and Connect.
                  </p>
                </div>

                {/* Properties */}
                <div>
                  <h3 className="font-semibold mb-4">Properties</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="/properties/buy">Buy</Link></li>
                    <li><Link href="/properties/rent">Rent</Link></li>
                    <li><Link href="/properties/sell">Sell</Link></li>
                    <li><Link href="/properties/valuation">Valuation</Link></li>
                  </ul>
                </div>

                {/* Services & Leisure */}
                <div>
                  <h3 className="font-semibold mb-4">Services & Leisure</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="/services/trades">Trades</Link></li>
                    <li><Link href="/services/professional">Professional</Link></li>
                    <li><Link href="/leisure/rentals">Rentals</Link></li>
                    <li><Link href="/leisure/experiences">Experiences</Link></li>
                  </ul>
                </div>

                {/* Connect & Legal */}
                <div>
                  <h3 className="font-semibold mb-4">Connect & Legal</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="/connect/social">Social</Link></li>
                    <li><Link href="/connect/crm">CRM</Link></li>
                    <li><Link href="/legal/privacy">Privacy Policy</Link></li>
                    <li><Link href="/legal/terms">Terms of Service</Link></li>
                  </ul>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} GREIA. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}