import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/providers/auth-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import Navigation from '@/components/navigation/main-nav'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GREIA - Life\'s Operating System',
  description: 'Your unified platform for properties, services, leisure, and networking',
  icons: {
    icon: '/images/greia-favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
              {/* Main Navigation */}
              <header className="greia-nav sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="greia-container">
                  <div className="greia-nav-content">
                    <Navigation />
                    <div className="fixed right-4 top-4">
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-grow">
                {children}
              </main>

              {/* Footer */}
              <footer className="border-t bg-muted/50">
                <div className="greia-container py-12 md:py-16">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Column */}
                    <div className="space-y-4">
                      <img 
                        src="/images/greia-logo.png" 
                        alt="GREIA" 
                        className="h-8 dark:invert"
                      />
                      <p className="text-sm text-muted-foreground">
                        Life's Operating System - Your unified platform for properties, services, leisure, and networking.
                      </p>
                    </div>

                    {/* Properties Column */}
                    <div>
                      <h3 className="font-semibold mb-4">Properties</h3>
                      <ul className="space-y-2">
                        <li><a href="/properties" className="greia-nav-link">Browse Properties</a></li>
                        <li><a href="/properties/sell" className="greia-nav-link">Sell Property</a></li>
                        <li><a href="/properties/rent" className="greia-nav-link">Rent Property</a></li>
                        <li><a href="/properties/agents" className="greia-nav-link">Find Agents</a></li>
                      </ul>
                    </div>

                    {/* Services Column */}
                    <div>
                      <h3 className="font-semibold mb-4">Services</h3>
                      <ul className="space-y-2">
                        <li><a href="/services" className="greia-nav-link">Browse Services</a></li>
                        <li><a href="/services/trades" className="greia-nav-link">Find Trades</a></li>
                        <li><a href="/services/professional" className="greia-nav-link">Professional Services</a></li>
                        <li><a href="/services/provide" className="greia-nav-link">Become a Provider</a></li>
                      </ul>
                    </div>

                    {/* Connect Column */}
                    <div>
                      <h3 className="font-semibold mb-4">Connect</h3>
                      <ul className="space-y-2">
                        <li><a href="/connect" className="greia-nav-link">Network</a></li>
                        <li><a href="/connect/crm" className="greia-nav-link">CRM</a></li>
                        <li><a href="/connect/groups" className="greia-nav-link">Groups</a></li>
                        <li><a href="/help" className="greia-nav-link">Help Center</a></li>
                      </ul>
                    </div>
                  </div>

                  {/* Bottom Bar */}
                  <div className="mt-8 pt-8 border-t">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} GREIA. All rights reserved.
                      </p>
                      <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="/legal/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                          Privacy Policy
                        </a>
                        <a href="/legal/terms" className="text-sm text-muted-foreground hover:text-foreground">
                          Terms of Service
                        </a>
                        <a href="/legal/cookies" className="text-sm text-muted-foreground hover:text-foreground">
                          Cookie Policy
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}