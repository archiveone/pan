import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GREIA - Life\'s Operating System',
  description: 'One super-app for lifestyle, property, and networking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-white">
          {/* Navigation will go here */}
          {children}
          {/* Footer will go here */}
        </main>
      </body>
    </html>
  )
}