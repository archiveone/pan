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
import { Plus, User, LogOut } from 'lucide-react';

export function MainHeader() {
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
    <header className="relative">
      {/* Gradient Header */}
      <div className="relative h-24 greia-gradient">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-center items-center">
          <Link href="/" className="relative">
            <div className="relative h-12 w-48">
              <Image
                src="/images/greia-logo-white.svg"
                alt="GREIA"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Navy Navigation Bar */}
      <div
        className={cn(
          'sticky top-0 z-50 bg-[#0A1F44] transition-all duration-200',
          isScrolled && 'shadow-lg'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Main Navigation */}
            <nav className="flex-1">
              <ul className="flex space-x-1">
                <li>
                  <Link
                    href="/"
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors',
                      router.pathname === '/' && 'bg-white/10 text-white'
                    )}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/properties"
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors',
                      router.pathname.startsWith('/properties') && 'bg-white/10 text-white'
                    )}
                  >
                    Properties
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors',
                      router.pathname.startsWith('/services') && 'bg-white/10 text-white'
                    )}
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/leisure"
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors',
                      router.pathname.startsWith('/leisure') && 'bg-white/10 text-white'
                    )}
                  >
                    Leisure
                  </Link>
                </li>
                <li>
                  <Link
                    href="/network"
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors',
                      router.pathname.startsWith('/network') && 'bg-white/10 text-white'
                    )}
                  >
                    Network
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Add Listing Button */}
              <Button
                variant="default"
                size="sm"
                className="bg-white text-[#0A1F44] hover:bg-white/90"
                onClick={() => router.push('/add-listing')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Listing
              </Button>

              {/* User Menu */}
              {session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full border-2 border-white/20"
                    >
                      <Avatar>
                        <AvatarImage
                          src={session.user.image || ''}
                          alt={session.user.name || ''}
                        />
                        <AvatarFallback className="bg-white/10 text-white">
                          {session.user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(\`/profile/\${session.user.username}\`)
                      }
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/api/auth/signout')}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={() => router.push('/api/auth/signin')}
                >
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}