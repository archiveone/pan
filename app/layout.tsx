import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GREIA - Life\'s Operating System',
  description: 'One super-app for lifestyle, property, and networking that serves as the digital fabric of everyday life.',
  keywords: [
    'property marketplace',
    'real estate',
    'services marketplace',
    'leisure activities',
    'social networking',
    'CRM system',
    'property management',
    'rental marketplace',
    'professional services'
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </body>
    </html>
  )
}