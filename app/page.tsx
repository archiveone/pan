import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Briefcase, Compass, Search } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-worldwide.jpg"
            alt="My Home Worldwide"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Your Gateway to Global Living
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Discover properties, services, and experiences worldwide. Your life's operating
              system starts here.
            </p>

            {/* Search Section */}
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-xl">
              <div className="flex flex-col space-y-4">
                {/* Category Selection */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-12"
                  >
                    <Building2 className="h-5 w-5" />
                    <span>Properties</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-12"
                  >
                    <Briefcase className="h-5 w-5" />
                    <span>Services</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-12"
                  >
                    <Compass className="h-5 w-5" />
                    <span>Leisure</span>
                  </Button>
                </div>

                {/* Search Bar */}
                <div className="flex space-x-2">
                  <Select defaultValue="buy">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="book">Book</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search location or keyword..."
                      className="pl-10"
                    />
                  </div>
                  <Button className="px-8">Search</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Properties</h2>
            <Link href="/properties" className="text-primary hover:underline">
              View all properties
            </Link>
          </div>
          {/* Property cards would go here */}
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Popular Services</h2>
            <Link href="/services" className="text-primary hover:underline">
              View all services
            </Link>
          </div>
          {/* Service cards would go here */}
        </div>
      </section>

      {/* Leisure Experiences Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Leisure Experiences</h2>
            <Link href="/leisure" className="text-primary hover:underline">
              View all experiences
            </Link>
          </div>
          {/* Experience cards would go here */}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 greia-gradient opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Join the GREIA Community
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with property owners, service providers, and experience creators
            worldwide. Start your journey today.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg">
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}