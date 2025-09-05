import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  Home,
  Building2,
  Briefcase,
  Compass,
  Users,
  MessageCircle,
  Bell,
  Search,
  Menu,
  Settings,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { NotificationsPopover } from '@/components/notifications/NotificationsPopover';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      current: router.pathname === '/'
    },
    {
      name: 'Properties',
      href: '/properties',
      icon: Building2,
      current: router.pathname.startsWith('/properties')
    },
    {
      name: 'Services',
      href: '/services',
      icon: Briefcase,
      current: router.pathname.startsWith('/services')
    },
    {
      name: 'Leisure',
      href: '/leisure',
      icon: Compass,
      current: router.pathname.startsWith('/leisure')
    },
    {
      name: 'Network',
      href: '/network',
      icon: Users,
      current: router.pathname.startsWith('/network')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navigation */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="GREIA"
              />
              <span className="text-xl font-semibold">GREIA</span>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                          item.current
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 mr-2" />
                  ) : (
                    <Moon className="h-5 w-5 mr-2" />
                  )}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle>
              <Link href="/" className="flex items-center space-x-2">
                <img
                  className="h-8 w-auto"
                  src="/logo.svg"
                  alt="GREIA"
                />
                <span className="text-xl font-semibold">GREIA</span>
              </Link>
            </SheetTitle>
          </SheetHeader>
          <nav className="mt-6">
            <ul role="list" className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                      item.current
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <item.icon className="h-6 w-6 shrink-0" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Search */}
            <div className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute left-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-10"
                onClick={() => setIsSearchOpen(true)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {session?.user && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => router.push('/messages')}
                  >
                    <MessageCircle className="h-6 w-6" />
                  </Button>

                  <NotificationsPopover>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Bell className="h-6 w-6" />
                    </Button>
                  </NotificationsPopover>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar>
                          <AvatarImage
                            src={session.user.image || ''}
                            alt={session.user.name || ''}
                          />
                          <AvatarFallback>
                            {session.user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(\`/profile/\${session.user.username}\`)
                        }
                      >
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/api/auth/signout')}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search everything..."
                  className="flex-1"
                  autoFocus
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm">Properties</Button>
                <Button variant="secondary" size="sm">Services</Button>
                <Button variant="secondary" size="sm">Leisure</Button>
                <Button variant="secondary" size="sm">People</Button>
              </div>
              {/* Search Results would go here */}
            </div>
            <Button
              variant="ghost"
              className="absolute right-4 top-4"
              onClick={() => setIsSearchOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}