'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Home,
  Building2,
  Wrench,
  Ticket,
  Users,
  Bell,
  MessageSquare,
  Menu,
  X,
  Search,
  ChevronDown,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const navigation = [
  {
    name: 'Properties',
    href: '/properties',
    icon: Building2,
    items: [
      { name: 'Buy', href: '/properties/buy' },
      { name: 'Rent', href: '/properties/rent' },
      { name: 'Sell', href: '/properties/sell' },
      { name: 'Luxury', href: '/properties/luxury' },
      { name: 'Commercial', href: '/properties/commercial' },
      { name: 'Timeshares', href: '/properties/timeshares' },
    ],
  },
  {
    name: 'Services',
    href: '/services',
    icon: Wrench,
    items: [
      { name: 'Trades', href: '/services/trades' },
      { name: 'Contractors', href: '/services/contractors' },
      { name: 'Professional', href: '/services/professional' },
      { name: 'Specialists', href: '/services/specialists' },
    ],
  },
  {
    name: 'Leisure',
    href: '/leisure',
    icon: Ticket,
    items: [
      { name: 'Car Rentals', href: '/leisure/cars' },
      { name: 'Boat Rentals', href: '/leisure/boats' },
      { name: 'Venue Hire', href: '/leisure/venues' },
      { name: 'Experiences', href: '/leisure/experiences' },
      { name: 'Events', href: '/leisure/events' },
    ],
  },
  {
    name: 'Connect',
    href: '/connect',
    icon: Users,
    items: [
      { name: 'Social Feed', href: '/connect/feed' },
      { name: 'Network', href: '/connect/network' },
      { name: 'Groups', href: '/connect/groups' },
      { name: 'CRM', href: '/connect/crm' },
    ],
  },
];

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="sr-only">GREIA</span>
              <img
                className="h-8 w-auto"
                src="/images/logo.svg"
                alt="GREIA Logo"
              />
              <span className="ml-3 text-xl font-bold text-gray-900">GREIA</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            {navigation.map((item) => (
              <DropdownMenu key={item.name}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'flex items-center space-x-1',
                      pathname.startsWith(item.href) && 'text-primary'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {item.items.map((subItem) => (
                    <DropdownMenuItem key={subItem.name} asChild>
                      <Link
                        href={subItem.href}
                        className={cn(
                          pathname === subItem.href && 'bg-muted'
                        )}
                      >
                        {subItem.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-64 pl-9"
              />
            </div>

            {session ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                    3
                  </Badge>
                </Button>

                <Button variant="ghost" size="icon">
                  <MessageSquare className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar>
                        <AvatarImage src={session.user?.image || ''} />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between py-4">
                    <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                      <img
                        className="h-8 w-auto"
                        src="/images/logo.svg"
                        alt="GREIA Logo"
                      />
                      <span className="ml-3 text-xl font-bold">GREIA</span>
                    </Link>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-6 w-6" />
                      </Button>
                    </SheetClose>
                  </div>

                  <div className="relative my-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="w-full pl-9"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-2">
                      {navigation.map((item) => (
                        <div key={item.name} className="space-y-1">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <item.icon className="h-4 w-4 mr-2" />
                            {item.name}
                          </Button>
                          <div className="pl-6 space-y-1">
                            {item.items.map((subItem) => (
                              <Button
                                key={subItem.name}
                                variant="ghost"
                                className="w-full justify-start text-sm"
                                asChild
                              >
                                <Link
                                  href={subItem.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {subItem.name}
                                </Link>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t py-4">
                    {session ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 px-2">
                          <Avatar>
                            <AvatarImage src={session.user?.image || ''} />
                            <AvatarFallback>
                              {session.user?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {session.user?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" className="w-full justify-start">
                          Profile
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          Settings
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          Sign out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button className="w-full" asChild>
                          <Link href="/auth/signup">Sign up</Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/auth/login">Log in</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}