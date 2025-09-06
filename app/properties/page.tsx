"use client";

import { PropertyCard } from "@/components/properties/property-card";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

// Sample data - this would come from your API
const properties = [
  {
    id: "1",
    title: "Modern Apartment in City Center",
    price: 250000,
    location: "Dublin City Center",
    bedrooms: 2,
    bathrooms: 2,
    size: 85,
    imageUrl: "/images/properties/apartment-1.jpg",
    isFeatured: true,
  },
  {
    id: "2",
    title: "Spacious Family Home",
    price: 450000,
    location: "Galway Suburbs",
    bedrooms: 4,
    bathrooms: 3,
    size: 180,
    imageUrl: "/images/properties/house-1.jpg",
  },
  {
    id: "3",
    title: "Luxury Penthouse with Sea View",
    price: 750000,
    location: "Cork Docklands",
    bedrooms: 3,
    bathrooms: 2,
    size: 120,
    imageUrl: "/images/properties/penthouse-1.jpg",
    isFeatured: true,
  },
  // Add more properties as needed
];

export default function PropertiesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header section with glass effect */}
      <div className="glass border-b border-white/20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-gray-900 sm:text-5xl">
              Find Your Perfect Property
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Browse through our curated selection of premium properties
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Featured properties section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Featured Properties</h2>
            <a href="#" className="group flex items-center text-sm font-medium text-blue-600">
              View all
              <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          <div className="apple-grid">
            {properties
              .filter((property) => property.isFeatured)
              .map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
          </div>
        </section>

        {/* Recent properties section */}
        <section className="mt-16 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Recent Properties</h2>
            <a href="#" className="group flex items-center text-sm font-medium text-blue-600">
              View all
              <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          <div className="apple-grid">
            {properties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </section>

        {/* Pagination */}
        <nav className="mt-12 flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
          <div className="-mt-px flex w-0 flex-1">
            <a
              href="#"
              className="inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            >
              Previous
            </a>
          </div>
          <div className="hidden md:-mt-px md:flex">
            {[1, 2, 3].map((page) => (
              <a
                key={page}
                href="#"
                className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium ${
                  page === 1
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {page}
              </a>
            ))}
          </div>
          <div className="-mt-px flex w-0 flex-1 justify-end">
            <a
              href="#"
              className="inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            >
              Next
            </a>
          </div>
        </nav>
      </div>
    </main>
  );
}