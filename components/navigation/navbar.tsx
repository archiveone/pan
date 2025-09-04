'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`premium-nav ${
        isScrolled ? 'border-b shadow-sm' : 'border-b-0'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/greia-logo.png"
              alt="GREIA Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="font-bold text-xl">GREIA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Properties */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    Properties
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 w-[400px]">
                      <li className="row-span-3">
                        <Link href="/properties/browse" passHref legacyBehavior>
                          <NavigationMenuLink className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Browse Properties
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Explore our curated selection of properties worldwide
                            </p>
                          </NavigationMenuLink>
                        </Link>
                      </li>
                      <li>
                        <Link href="/private-marketplace" className="block p-3 hover:bg-muted rounded-md">
                          Private Marketplace
                        </Link>
                      </li>
                      <li>
                        <Link href="/properties/valuation" className="block p-3 hover:bg-muted rounded-md">
                          Property Valuation
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Services */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    Services
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 w-[400px]">
                      <li>
                        <Link href="/services/trades" className="block p-3 hover:bg-muted rounded-md">
                          Find Trades
                        </Link>
                      </li>
                      <li>
                        <Link href="/services/professionals" className="block p-3 hover:bg-muted rounded-md">
                          Professional Services
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Leisure */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    Leisure
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 w-[400px]">
                      <li>
                        <Link href="/leisure/rentals" className="block p-3 hover:bg-muted rounded-md">
                          Rentals
                        </Link>
                      </li>
                      <li>
                        <Link href="/leisure/experiences" className="block p-3 hover:bg-muted rounded-md">
                          Experiences
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Auth Buttons or User Menu */}
            {session ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Avatar>
                    <AvatarImage src={session.user.image || ''} />
                    <AvatarFallback>
                      {session.user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="premium-button">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <div className="space-y-2">
                <Link href="/properties/browse" className="block p-2 hover:bg-muted rounded-md">
                  Properties
                </Link>
                <Link href="/services" className="block p-2 hover:bg-muted rounded-md">
                  Services
                </Link>
                <Link href="/leisure" className="block p-2 hover:bg-muted rounded-md">
                  Leisure
                </Link>
              </div>
              
              {!session && (
                <div className="pt-4 border-t space-y-2">
                  <Link href="/auth/signin">
                    <Button variant="ghost" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="premium-button w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}