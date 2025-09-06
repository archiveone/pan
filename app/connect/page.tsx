"use client";

import PageLayout from "@/components/layout/page-layout";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

// Sample data
const connections = [
  {
    id: "1",
    name: "Sarah Johnson",
    title: "Luxury Real Estate Agent",
    company: "Premium Properties",
    location: "London, UK",
    imageUrl: "/images/connect/profile-1.jpg",
    mutualConnections: 12,
    verified: true,
    specialties: ["Luxury Homes", "Investment Properties"],
  },
  {
    id: "2",
    name: "Michael Chen",
    title: "Interior Designer",
    company: "Modern Spaces",
    location: "Paris, France",
    imageUrl: "/images/connect/profile-2.jpg",
    mutualConnections: 8,
    verified: true,
    specialties: ["Contemporary Design", "Luxury Interiors"],
  },
  {
    id: "3",
    name: "Emma Williams",
    title: "Yacht Charter Specialist",
    company: "Elite Maritime",
    location: "Monaco",
    imageUrl: "/images/connect/profile-3.jpg",
    mutualConnections: 15,
    verified: true,
    specialties: ["Luxury Yachts", "Private Events"],
  },
];

const categories = [
  "All Professionals",
  "Real Estate",
  "Interior Design",
  "Architecture",
  "Luxury Services",
  "Hospitality",
];

function ConnectionCard({ connection }: { connection: typeof connections[0] }) {
  return (
    <div className="group relative animate-fade-up">
      <div className="card overflow-hidden">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="relative h-16 w-16 flex-shrink-0">
              <Image
                src={connection.imageUrl}
                alt={connection.name}
                className="rounded-full object-cover"
                fill
                sizes="64px"
              />
              {connection.verified && (
                <div className="absolute -right-1 -bottom-1">
                  <svg className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.119 3.121a1 1 0 001.414 0l5.952-5.95-1.062-1.062-5.6 5.6z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                {connection.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {connection.title} at {connection.company}
              </p>
              <p className="text-sm text-gray-500">{connection.location}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {connection.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="glass rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-900"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {connection.mutualConnections} mutual connections
            </span>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button className="btn-primary flex-1">Connect</button>
            <button className="btn-secondary flex-1">View Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConnectPage() {
  return (
    <PageLayout
      header={{
        title: "Professional Network",
        description: "Connect with luxury professionals and industry experts",
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

      {/* Featured professionals */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Featured Professionals
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
          {connections.map((connection) => (
            <ConnectionCard key={connection.id} connection={connection} />
          ))}
        </div>
      </section>

      {/* Recommended connections */}
      <section className="mt-16 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Recommended for You
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
          {connections.map((connection) => (
            <ConnectionCard key={connection.id} connection={connection} />
          ))}
        </div>
      </section>
    </PageLayout>
  );
}