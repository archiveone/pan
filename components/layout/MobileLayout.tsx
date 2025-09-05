import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Menu,
  Home,
  Building2,
  Briefcase,
  Compass,
  Users,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Properties',
      href: '/properties',
      icon: Building2,
    },
    {
      name: 'Services',
      href: '/services',
      icon: Briefcase,
    },
    {
      name: 'Leisure',
      href: '/leisure',
      icon: Compass,
    },
    {
      name: 'Network',
      href: '/network',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="flex items-center justify-between px-4 h-full">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <div className="flex items-center space-x-4 mb-6 px-2">
                  <Avatar>
                    <AvatarImage src="/path-to-avatar.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-muted-foreground">
                      john@example.com
                    </p>
                  </div>
                </div>
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-2 py-2 rounded-lg transition-colors",
                        pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard">
            <div className="relative h-8 w-24">
              {/* Replace with your logo */}
              <span className="font-bold">GREIA</span>
            </div>
          </Link>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Content */}
      <main className="pt-16 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="grid grid-cols-5 h-full">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Quick Actions */}
      <div className="fixed right-4 bottom-20 z-50">
        <div className="flex flex-col space-y-2">
          <Button
            size="icon"
            className="rounded-full shadow-lg"
            onClick={() => {}}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Mobile-optimized components
export function MobileCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-card rounded-lg shadow-sm p-4 space-y-4">
      {children}
    </div>
  );
}

export function MobileList({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y">
      {children}
    </div>
  );
}

export function MobileListItem({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: any;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center space-x-4 py-4">
      {Icon && (
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground truncate">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

export function MobileBottomSheet({
  children,
  title,
  isOpen,
  onClose
}: {
  children: ReactNode;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function MobileSearchBar({
  placeholder,
  value,
  onChange
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}

export function MobileRefreshPull() {
  return (
    <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
      <ArrowDown className="h-4 w-4 mr-2 animate-bounce" />
      Pull to refresh
    </div>
  );
}