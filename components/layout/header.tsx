'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import {
  Home,
  Building2,
  Briefcase,
  Compass,
  Users,
  Bell,
  MessageSquare,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  User as UserIcon,
  Heart,
  Calendar,
  PlusCircle,
} from 'lucide-react';

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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user?: User;
}

const mainNavItems = [
  {
    title: 'Properties',
    href: '/properties',
    icon: Building2,
    description: 'Buy, rent, or sell properties',
  },
  {
    title: 'Services',
    href: '/services',
    icon: Briefcase,
    description: 'Find or offer professional services',
  },
  {
    title: 'Leisure',
    href: '/leisure',
    icon: Compass,
    description: 'Discover experiences and rentals',
  },
  {
    title: 'Connect',
    href: '/connect',
    icon: Users,
    description: 'Network with professionals',
  },
];

export function Header({ user }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-background/80 backdrop-blur-lg border-b shadow-sm'
          : 'bg-background'
      )}
    >
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.svg"
              alt="GREIA"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="font-display font-bold text-xl hidden sm:inline-block">
              GREIA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {mainNavItems.map((item) => (
              <DropdownMenu key={item.href}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                      pathname?.startsWith(item.href)
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.title}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>{item.description}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {item.title === 'Properties' && (
                    <>
                      <DropdownMenuItem>
                        <Link href="/properties/buy" className="flex items-center">
                          Buy Property
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/properties/rent" className="flex items-center">
                          Rent Property
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/properties/sell" className="flex items-center">
                          Sell Property
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/properties/value" className="flex items-center">
                          Value My Property
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {item.title === 'Services' && (
                    <>
                      <DropdownMenuItem>
                        <Link href="/services/trades" className="flex items-center">
                          Find Trades
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/services/professional" className="flex items-center">
                          Professional Services
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/services/offer" className="flex items-center">
                          Offer Services
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {item.title === 'Leisure' && (
                    <>
                      <DropdownMenuItem>
                        <Link href="/leisure/rentals" className="flex items-center">
                          Rentals
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/leisure/experiences" className="flex items-center">
                          Experiences
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/leisure/list" className="flex items-center">
                          List Your Rental/Experience
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {item.title === 'Connect' && (
                    <>
                      <DropdownMenuItem>
                        <Link href="/connect/network" className="flex items-center">
                          My Network
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/connect/discover" className="flex items-center">
                          Discover People
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/connect/groups" className="flex items-center">
                          Groups
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Quick Actions */}
                <div className="hidden md:flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    asChild
                  >
                    <Link href="/notifications">
                      <Bell className="w-5 h-5" />
                      <Badge
                        variant="secondary"
                        className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                      >
                        3
                      </Badge>
                    </Link>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    asChild
                  >
                    <Link href="/messages">
                      <MessageSquare className="w-5 h-5" />
                      <Badge
                        variant="secondary"
                        className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                      >
                        2
                      </Badge>
                    </Link>
                  </Button>

                  <Button variant="outline" asChild>
                    <Link href="/listings/create">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      List
                    </Link>
                  </Button>
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ''} alt={user.name || ''} />
                        <AvatarFallback>
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <Home className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.id}`}>
                        <UserIcon className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites">
                        <Heart className="w-4 h-4 mr-2" />
                        Favorites
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookings">
                        <Calendar className="w-4 h-4 mr-2" />
                        Bookings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onSelect={() => signOut()}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open Menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-4">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary',
                        pathname?.startsWith(item.href)
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                  {user && (
                    <>
                      <hr className="border-border" />
                      <Link
                        href="/notifications"
                        className="flex items-center space-x-2 text-sm font-medium text-muted-foreground"
                      >
                        <Bell className="w-5 h-5" />
                        <span>Notifications</span>
                        <Badge variant="secondary">3</Badge>
                      </Link>
                      <Link
                        href="/messages"
                        className="flex items-center space-x-2 text-sm font-medium text-muted-foreground"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span>Messages</span>
                        <Badge variant="secondary">2</Badge>
                      </Link>
                      <Link
                        href="/listings/create"
                        className="flex items-center space-x-2 text-sm font-medium text-muted-foreground"
                      >
                        <PlusCircle className="w-5 h-5" />
                        <span>Create Listing</span>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}