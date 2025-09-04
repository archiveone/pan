import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/greia-logo.png"
                alt="GREIA Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="font-bold text-xl">GREIA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Life's Operating System - One super-app for lifestyle, property, and networking
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Properties */}
          <div>
            <h3 className="font-semibold mb-4">Properties</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/properties/browse" className="text-sm text-muted-foreground hover:text-foreground">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link href="/private-marketplace" className="text-sm text-muted-foreground hover:text-foreground">
                  Private Marketplace
                </Link>
              </li>
              <li>
                <Link href="/properties/valuation" className="text-sm text-muted-foreground hover:text-foreground">
                  Property Valuation
                </Link>
              </li>
              <li>
                <Link href="/properties/agents" className="text-sm text-muted-foreground hover:text-foreground">
                  Find an Agent
                </Link>
              </li>
            </ul>
          </div>

          {/* Services & Leisure */}
          <div>
            <h3 className="font-semibold mb-4">Services & Leisure</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services/trades" className="text-sm text-muted-foreground hover:text-foreground">
                  Find Trades
                </Link>
              </li>
              <li>
                <Link href="/services/professionals" className="text-sm text-muted-foreground hover:text-foreground">
                  Professional Services
                </Link>
              </li>
              <li>
                <Link href="/leisure/rentals" className="text-sm text-muted-foreground hover:text-foreground">
                  Rentals
                </Link>
              </li>
              <li>
                <Link href="/leisure/experiences" className="text-sm text-muted-foreground hover:text-foreground">
                  Experiences
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>Worldwide</span>
              <span>© {new Date().getFullYear()} GREIA. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}