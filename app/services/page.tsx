"use client";

import PageLayout from "@/components/layout/page-layout";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

// Sample data
const services = [
  {
    id: "1",
    title: "Home Cleaning",
    description: "Professional cleaning services for your home",
    price: "From €50/hour",
    rating: 4.8,
    reviews: 128,
    imageUrl: "/images/services/cleaning.jpg",
    category: "Home Services",
  },
  {
    id: "2",
    title: "Plumbing",
    description: "Expert plumbing repairs and installations",
    price: "From €80/hour",
    rating: 4.9,
    reviews: 256,
    imageUrl: "/images/services/plumbing.jpg",
    category: "Maintenance",
  },
  {
    id: "3",
    title: "Interior Design",
    description: "Transform your space with professional design",
    price: "From €150/hour",
    rating: 5.0,
    reviews: 64,
    imageUrl: "/images/services/interior-design.jpg",
    category: "Design",
  },
];

const categories = [
  "All Services",
  "Home Services",
  "Maintenance",
  "Design",
  "Landscaping",
  "Security",
];

function ServiceCard({ service }: { service: typeof services[0] }) {
  return (
    <div className="group relative animate-fade-up">
      <div className="card overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
          <Image
            src={service.imageUrl}
            alt={service.title}
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {service.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{service.category}</p>
              </div>
              <p className="text-lg font-medium text-gray-900">{service.price}</p>
            </div>

            <p className="text-sm text-gray-600">{service.description}</p>

            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(service.rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 15.585l-6.327 3.323 1.209-7.037L.172 7.282l7.046-1.024L10 0l2.782 6.258 7.046 1.024-4.71 4.589 1.209 7.037z"
                      clipRule="evenodd"
                    />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                ({service.reviews} reviews)
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button className="btn-primary flex-1">Book Now</button>
            <button className="btn-secondary flex-1">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <PageLayout
      header={{
        title: "Professional Services",
        description: "Find trusted professionals for all your needs",
      }}
    >
      {/* Categories */}
      <div className="glass mb-12 rounded-2xl p-4">
        <div className="flex items-center gap-4 overflow-x-auto py-2">
          {categories.map((category) => (
            <button
              key={category}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Featured services */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Featured Services
          </h2>
          <a
            href="#"
            className="group flex items-center text-sm font-medium text-blue-600"
          >
            View all
            <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
        <div className="apple-grid">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* Popular categories */}
      <section className="mt-16 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Popular Categories
          </h2>
          <a
            href="#"
            className="group flex items-center text-sm font-medium text-blue-600"
          >
            View all
            <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
        <div className="apple-grid">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </PageLayout>
  );
}