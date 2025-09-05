import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@/components/ui/navigation-menu';
import {
  Building2,
  Briefcase,
  Compass,
  Users,
  MessageCircle,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
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
        isScrolled
          ? 'bg-background/80 backdrop-blur-sm border-b'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-10 w-32">
              <Image
                src="/images/greia-logo-gradient.svg"
                alt="GREIA"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Main Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Properties</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 w-[400px] grid-cols-2">
                    <li className="col-span-2">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/properties"
                          className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent"
                        >
                          <Building2 className="h-5 w-5" />
                          <div>
                            <div className="font-medium">All Properties</div>
                            <p className="text-sm text-muted-foreground">
                              Browse all available properties
                            </p>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/properties/residential"
                          className="block p-2 rounded-md hover:bg-accent"
                        >
                          <div className="font-medium">Residential</div>
                          <p className="text-sm text-muted-foreground">
                            Houses and apartments
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/properties/commercial"
                          className="block p-2 rounded-md hover:bg-accent"
                        >
                          <div className="font-medium">Commercial</div>
                          <p className="text-sm text-muted-foreground">
                            Office and retail spaces
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 w-[400px] grid-cols-2">
                    <li className="col-span-2">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/services"
                          className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent"
                        >
                          <Briefcase className="h-5 w-5" />
                          <div>
                            <div className="font-medium">All Services</div>
                            <p className="text-sm text-muted-foreground">
                              Browse all available services
                            </p>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/services/trades"
                          className="block p-2 rounded-md hover:bg-accent"
                        >
                          <div className="font-medium">Trades</div>
                          <p className="text-sm text-muted-foreground">
                            Professional contractors
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/services/professional"
                          className="block p-2 rounded-md hover:bg-accent"
                        >
                          <div className="font-medium">Professional</div>
                          <p className="text-sm text-muted-foreground">
                            Business services
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Leisure</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 w-[400px] grid-cols-2">
                    <li className="col-span-2">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/leisure"
                          className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent"
                        >
                          <Compass className="h-5 w-5" />
                          <div>
                            <div className="font-medium">All Leisure</div>
                            <p className="text-sm text-muted-foreground">
                              Browse all leisure activities
                            </p>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/leisure/rentals"
                          className="block p-2 rounded-md hover:bg-accent"
                        >
                          <div className="font-medium">Rentals</div>
                          <p className="text-sm text-muted-foreground">
                            Cars, boats, and venues
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/leisure/experiences"
                          className="block p-2 rounded-md hover:bg-accent"
                        >
                          <div className="font-medium">Experiences</div>
                          <p className="text-sm text-muted-foreground">
                            Events and activities
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/network"
                    className={cn(
                      'flex items-center space-x-1 px-4 py-2 rounded-md transition-colors',
                      router.pathname.startsWith('/network')
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Users className="h-5 w-5" />
                    <span>Network</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {session?.user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => router.push('/messages')}
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => router.push('/notifications')}
                >
                  <Bell className="h-5 w-5" />
                </Button>

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
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/api/auth/signin')}
                >
                  Sign in
                </Button>
                <Button onClick={() => router.push('/signup')}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}