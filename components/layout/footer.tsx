'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  properties: [
    { label: 'Buy Property', href: '/properties/buy' },
    { label: 'Rent Property', href: '/properties/rent' },
    { label: 'Sell Property', href: '/properties/sell' },
    { label: 'Property Valuation', href: '/properties/value' },
    { label: 'Private Marketplace', href: '/properties/private' },
    { label: 'Commercial Properties', href: '/properties/commercial' },
  ],
  services: [
    { label: 'Find Trades', href: '/services/trades' },
    { label: 'Professional Services', href: '/services/professional' },
    { label: 'Offer Services', href: '/services/offer' },
    { label: 'Service Directory', href: '/services/directory' },
    { label: 'Verified Providers', href: '/services/verified' },
  ],
  leisure: [
    { label: 'Car Rentals', href: '/leisure/cars' },
    { label: 'Boat Rentals', href: '/leisure/boats' },
    { label: 'Venue Hire', href: '/leisure/venues' },
    { label: 'Experiences', href: '/leisure/experiences' },
    { label: 'List Your Rental', href: '/leisure/list' },
  ],
  connect: [
    { label: 'My Network', href: '/connect/network' },
    { label: 'Discover People', href: '/connect/discover' },
    { label: 'Groups', href: '/connect/groups' },
    { label: 'Events', href: '/connect/events' },
    { label: 'Business Directory', href: '/connect/directory' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Safety Center', href: '/safety' },
    { label: 'Community Guidelines', href: '/guidelines' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/greia',
    icon: Facebook,
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com/greia',
    icon: Twitter,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/greia',
    icon: Instagram,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/greia',
    icon: Linkedin,
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/greia',
    icon: Youtube,
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Newsletter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Subscribe to our newsletter
            </h3>
            <p className="text-muted-foreground mb-4">
              Get the latest updates on new features, community news, and tips for
              making the most of GREIA.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1"
            />
            <Button>Subscribe</Button>
          </div>
        </div>

        <Separator className="mb-12" />

        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          <div>
            <h4 className="font-semibold mb-4">Properties</h4>
            <ul className="space-y-2">
              {footerLinks.properties.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Leisure</h4>
            <ul className="space-y-2">
              {footerLinks.leisure.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              {footerLinks.connect.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.svg"
                alt="GREIA"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="font-display font-bold text-xl">GREIA</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              © {currentYear} GREIA. All rights reserved.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <Link
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <social.icon className="w-5 h-5" />
                <span className="sr-only">{social.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* App Store Links */}
        <div className="flex justify-center mt-8 space-x-4">
          <Link
            href="https://apps.apple.com/app/greia"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/app-store-badge.svg"
              alt="Download on the App Store"
              width={140}
              height={42}
              className="h-[42px] w-auto"
            />
          </Link>
          <Link
            href="https://play.google.com/store/apps/details?id=com.greia"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/google-play-badge.svg"
              alt="Get it on Google Play"
              width={140}
              height={42}
              className="h-[42px] w-auto"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}