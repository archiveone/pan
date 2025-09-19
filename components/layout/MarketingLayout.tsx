import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { NavigationMenu } from '../navigation/NavigationMenu'
import { MobileMenu } from '../navigation/MobileMenu'
import { Footer } from '../navigation/Footer'
import { ThemeToggle } from '../ui/ThemeToggle'
import { UserNav } from '../navigation/UserNav'

interface MarketingLayoutProps {
  children: React.ReactNode
  className?: string
}

export const MarketingLayout = ({ children, className }: MarketingLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6">
            <motion.a 
              href="/"
              className="flex items-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img src="/logo.svg" alt="GREIA" className="h-8 w-8" />
              <span className="hidden font-bold sm:inline-block">
                GREIA
              </span>
            </motion.a>
            <NavigationMenu className="hidden md:flex" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
            <MobileMenu className="md:hidden" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className={cn("flex-1", className)}
      >
        {children}
      </motion.main>

      {/* Footer */}
      <Footer />
    </div>
  )
}