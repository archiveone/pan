"use client";

import PageLayout from "@/components/layout/page-layout";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

// Sample data
const experiences = [
  {
    id: "1",
    title: "Luxury Yacht Charter",
    description: "Private yacht experience in the Mediterranean",
    price: "From €1,500/day",
    rating: 4.9,
    reviews: 48,
    imageUrl: "/images/leisure/yacht.jpg",
    category: "Water Activities",
    duration: "Full Day",
    location: "Mediterranean Sea",
  },
  {
    id: "2",
    title: "Wine Tasting Tour",
    description: "Exclusive wine tasting experience in premium vineyards",
    price: "From €200/person",
    rating: 4.8,
    reviews: 156,
    imageUrl: "/images/leisure/wine.jpg",
    category: "Food & Drink",
    duration: "4 hours",
    location: "Bordeaux Region",
  },
  {
    id: "3",
    title: "Private Villa Retreat",
    description: "Luxurious villa with private pool and chef",
    price: "From €800/night",
    rating: 5.0,
    reviews: 92,
    imageUrl: "/images/leisure/villa.jpg",
    category: "Accommodations",
    duration: "Flexible",
    location: "Coastal Paradise",
  },
];

const categories = [
  "All Experiences",
  "Water Activities",
  "Food & Drink",
  "Accommodations",
  "Adventure",
  "Wellness",
];

function ExperienceCard({ experience }: { experience: typeof experiences[0] }) {
  return (
    <div className="group relative animate-fade-up">
      <div className="card overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
          <Image
            src={experience.imageUrl}
            alt={experience.title}
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Category badge */}
          <div className="absolute left-4 top-4">
            <span className="glass px-3 py-1 text-xs font-medium text-gray-900">
              {experience.category}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {experience.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{experience.location}</p>
              </div>
              <p className="text-lg font-medium text-gray-900">{experience.price}</p>
            </div>

            <p className="text-sm text-gray-600">{experience.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(experience.rating)
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
                  ({experience.reviews} reviews)
                </span>
              </div>
              <span className="text-sm text-gray-500">{experience.duration}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button className="btn-primary flex-1">Book Experience</button>
            <button className="btn-secondary flex-1">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeisurePage() {
  return (
    <PageLayout
      header={{
        title: "Luxury Experiences",
        description: "Discover extraordinary experiences and adventures",
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

      {/* Featured experiences */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Featured Experiences
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
          {experiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      </section>

      {/* Trending experiences */}
      <section className="mt-16 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Trending Now
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
          {experiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      </section>
    </PageLayout>
  );
}