import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Gradient Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#2B59FF] via-[#BB2BFF] to-[#FF2B2B] opacity-10"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-2">
                Stay updated with GREIA
              </h3>
              <p className="text-muted-foreground">
                Get the latest news, updates, and insights from the world of real estate,
                services, and leisure activities.
              </p>
            </div>
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button>
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="block">
              <div className="relative h-12 w-40">
                <Image
                  src="/images/greia-logo-gradient.svg"
                  alt="GREIA"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Life's Operating System - Your all-in-one platform for properties,
              services, leisure, and professional networking.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://facebook.com/greia" target="_blank">
                  <Facebook className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://twitter.com/greia" target="_blank">
                  <Twitter className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://instagram.com/greia" target="_blank">
                  <Instagram className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://linkedin.com/company/greia" target="_blank">
                  <Linkedin className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://youtube.com/greia" target="_blank">
                  <Youtube className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Properties Column */}
          <div>
            <h4 className="font-semibold mb-4">Properties</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/properties/residential"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Residential
                </Link>
              </li>
              <li>
                <Link
                  href="/properties/commercial"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Commercial
                </Link>
              </li>
              <li>
                <Link
                  href="/properties/luxury"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Luxury
                </Link>
              </li>
              <li>
                <Link
                  href="/properties/investment"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Investment
                </Link>
              </li>
              <li>
                <Link
                  href="/properties/new-developments"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  New Developments
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/services/trades"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Trades
                </Link>
              </li>
              <li>
                <Link
                  href="/services/professional"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Professional Services
                </Link>
              </li>
              <li>
                <Link
                  href="/services/property-management"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Property Management
                </Link>
              </li>
              <li>
                <Link
                  href="/services/consultancy"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Consultancy
                </Link>
              </li>
              <li>
                <Link
                  href="/services/financial"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Financial Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Press
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GREIA. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cookie Policy
              </Link>
              <Link
                href="/sitemap"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}