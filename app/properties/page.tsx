"use client";

import { PropertyCard } from "@/components/properties/property-card";
import DashboardLayout from "@/components/layout/dashboard-layout";

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
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
          <p className="mt-2 text-sm text-gray-700">
            Browse through our selection of properties for sale and rent
          </p>
        </div>

        {/* Featured properties */}
        <div>
          <h2 className="text-lg font-medium text-gray-900">Featured Properties</h2>
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {properties
              .filter((property) => property.isFeatured)
              .map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
          </div>
        </div>

        {/* All properties */}
        <div>
          <h2 className="text-lg font-medium text-gray-900">All Properties</h2>
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <a
              href="#"
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </a>
            <a
              href="#"
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </a>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">10</span> of{" "}
                <span className="font-medium">97</span> results
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <a
                  href="#"
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-current="page"
                  className="relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  1
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  2
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  3
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}