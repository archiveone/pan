'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const navigation = {
  properties: [
    { name: 'Buy', href: '/properties/buy' },
    { name: 'Rent', href: '/properties/rent' },
    { name: 'Sell', href: '/properties/sell' },
    { name: 'Luxury', href: '/properties/luxury' },
    { name: 'Commercial', href: '/properties/commercial' },
    { name: 'Timeshares', href: '/properties/timeshares' },
    { name: 'New Developments', href: '/properties/new-developments' },
    { name: 'Property Valuation', href: '/properties/valuation' },
  ],
  services: [
    { name: 'Trades', href: '/services/trades' },
    { name: 'Contractors', href: '/services/contractors' },
    { name: 'Professional Services', href: '/services/professional' },
    { name: 'Specialists', href: '/services/specialists' },
    { name: 'Home Services', href: '/services/home' },
    { name: 'Business Services', href: '/services/business' },
    { name: 'Service Directory', href: '/services/directory' },
    { name: 'Become a Provider', href: '/services/become-provider' },
  ],
  leisure: [
    { name: 'Car Rentals', href: '/leisure/cars' },
    { name: 'Boat Rentals', href: '/leisure/boats' },
    { name: 'Venue Hire', href: '/leisure/venues' },
    { name: 'Experiences', href: '/leisure/experiences' },
    { name: 'Events', href: '/leisure/events' },
    { name: 'Activities', href: '/leisure/activities' },
    { name: 'Travel', href: '/leisure/travel' },
    { name: 'List Your Service', href: '/leisure/list-service' },
  ],
  connect: [
    { name: 'Social Feed', href: '/connect/feed' },
    { name: 'Network', href: '/connect/network' },
    { name: 'Groups', href: '/connect/groups' },
    { name: 'CRM', href: '/connect/crm' },
    { name: 'Messages', href: '/connect/messages' },
    { name: 'Notifications', href: '/connect/notifications' },
    { name: 'Find Friends', href: '/connect/find-friends' },
    { name: 'Business Network', href: '/connect/business' },
  ],
  company: [
    { name: 'About', href: '/company/about' },
    { name: 'Careers', href: '/company/careers' },
    { name: 'Press', href: '/company/press' },
    { name: 'Blog', href: '/company/blog' },
    { name: 'Partners', href: '/company/partners' },
    { name: 'Testimonials', href: '/company/testimonials' },
    { name: 'Contact', href: '/company/contact' },
    { name: 'Investors', href: '/company/investors' },
  ],
  legal: [
    { name: 'Terms', href: '/legal/terms' },
    { name: 'Privacy', href: '/legal/privacy' },
    { name: 'Cookies', href: '/legal/cookies' },
    { name: 'Licenses', href: '/legal/licenses' },
    { name: 'Settings', href: '/legal/settings' },
    { name: 'Complaints', href: '/legal/complaints' },
  ],
  social: [
    {
      name: 'Facebook',
      href: 'https://facebook.com/greia',
      icon: Facebook,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/greia',
      icon: Twitter,
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/greia',
      icon: Instagram,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/greia',
      icon: Linkedin,
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/greia',
      icon: Youtube,
    },
  ],
};

export function Footer() {
  return (
    <footer className="bg-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center">
              <img
                className="h-12 w-auto"
                src="/images/logo.svg"
                alt="GREIA Logo"
              />
              <span className="ml-3 text-2xl font-bold text-gray-900">GREIA</span>
            </Link>
            <p className="text-sm leading-6 text-gray-600">
              Life's Operating System - Your unified platform for properties, services, leisure, and networking.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900">Properties</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.properties.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-600 hover:text-gray-900">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-gray-900">Services</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.services.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-600 hover:text-gray-900">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900">Leisure</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.leisure.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-600 hover:text-gray-900">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-gray-900">Connect</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.connect.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-600 hover:text-gray-900">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col items-start justify-between gap-y-12 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-sm font-semibold leading-6 text-gray-900">Subscribe to our newsletter</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Stay updated with the latest properties, services, and events in your area.
              </p>
            </div>
            <form className="w-full lg:w-auto">
              <div className="flex gap-x-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="min-w-0 flex-auto"
                />
                <Button type="submit">
                  Subscribe
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-gray-900/10 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            {navigation.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm leading-6 text-gray-600 hover:text-gray-900"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <p className="mt-8 text-sm leading-6 text-gray-600 md:order-1 md:mt-0">
            &copy; {new Date().getFullYear()} GREIA. All rights reserved.
          </p>
        </div>

        {/* App Store Badges */}
        <div className="mt-8 flex items-center justify-center space-x-4">
          <Link href="#" className="inline-block">
            <img
              src="/images/app-store-badge.svg"
              alt="Download on the App Store"
              className="h-10"
            />
          </Link>
          <Link href="#" className="inline-block">
            <img
              src="/images/google-play-badge.svg"
              alt="Get it on Google Play"
              className="h-10"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}