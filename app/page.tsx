'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Globe, Home, Briefcase, Coffee } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 z-10" />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-pattern" />
        </div>

        <div className="container relative z-20 px-4 py-32 mx-auto text-center">
          {/* Hero Text Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <motion.h1 
                className="text-6xl md:text-8xl font-bold tracking-tighter"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                my
              </motion.h1>
              <motion.h1 
                className="text-6xl md:text-8xl font-bold tracking-tighter"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                home
              </motion.h1>
              <motion.h1 
                className="text-6xl md:text-8xl font-bold tracking-tighter"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                worldwide
              </motion.h1>
            </div>

            <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Life's Operating System - One super-app for lifestyle, property, and networking
            </p>

            {/* Search Bar */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search properties, services, or experiences..."
                  className="premium-input pl-12 py-6 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button className="premium-button">
                Get Started
              </Button>
              <Button variant="outline" className="rounded-full px-6 py-3">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/50">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Everything you need in one place
          </h2>

          <div className="features-grid">
            {/* Properties */}
            <motion.div 
              className="premium-card p-8"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Home className="w-12 h-12 mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Properties</h3>
              <p className="text-muted-foreground">
                Buy, rent, or sell properties across residential, commercial, and luxury markets
              </p>
            </motion.div>

            {/* Services */}
            <motion.div 
              className="premium-card p-8"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Briefcase className="w-12 h-12 mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Services</h3>
              <p className="text-muted-foreground">
                Connect with trusted professionals, trades, and specialists
              </p>
            </motion.div>

            {/* Leisure */}
            <motion.div 
              className="premium-card p-8"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Coffee className="w-12 h-12 mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Leisure</h3>
              <p className="text-muted-foreground">
                Discover and book unique experiences, rentals, and venues
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Global Network Section */}
      <section className="py-24">
        <div className="container px-4 mx-auto text-center">
          <Globe className="w-16 h-16 mx-auto mb-8 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Global Network
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our worldwide community of property owners, service providers, and experience seekers
          </p>
        </div>
      </section>
    </main>
  );
}