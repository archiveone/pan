import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Sidebar } from '../navigation/Sidebar'
import { DashboardNav } from '../navigation/DashboardNav'
import { UserNav } from '../navigation/UserNav'
import { ThemeToggle } from '../ui/ThemeToggle'
import { NotificationsDropdown } from '../navigation/NotificationsDropdown'
import { SearchCommand } from '../ui/SearchCommand'
import { Button } from '../ui/Button'
import { Menu, Bell, Search, Plus } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

export const DashboardLayout = ({ children, className }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        className="fixed left-0 top-0 z-40 h-full w-64 transform -translate-x-full transition-transform duration-200 ease-in-out lg:translate-x-0"
      />

      {/* Main Content */}
      <div className={cn(
        "flex min-h-screen flex-col",
        "lg:pl-64", // Sidebar width
        className
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex items-center justify-between gap-4">
            {/* Left section */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <SearchCommand>
                <Button variant="outline" className="w-full justify-start text-muted-foreground">
                  <Search className="mr-2 h-4 w-4" />
                  Search...
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              </SearchCommand>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600" />
              </Button>
              
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Plus className="mr-2 h-4 w-4" />
                Create
              </Button>

              <ThemeToggle />
              <NotificationsDropdown />
              <UserNav />
            </div>
          </div>
        </header>

        {/* Dashboard Navigation */}
        <DashboardNav className="border-b" />

        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 container py-6"
        >
          {children}
        </motion.main>

        {/* Footer - Minimal in dashboard */}
        <footer className="border-t py-4">
          <div className="container flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2025 GREIA. All rights reserved.</p>
            <nav className="flex gap-4">
              <a href="/help" className="hover:underline">Help</a>
              <a href="/privacy" className="hover:underline">Privacy</a>
              <a href="/terms" className="hover:underline">Terms</a>
            </nav>
          </div>
        </footer>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}
    </div>
  )
}