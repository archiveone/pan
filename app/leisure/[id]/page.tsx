"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  UserGroupIcon,
  ChevronRightIcon,
  StarIcon,
  GlobeEuropeAfricaIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

// Sample data - would come from API
const experience = {
  id: "1",
  title: "Luxury Yacht Charter Experience",
  price: "€1,500/day",
  location: "Mediterranean Sea",
  description: "Embark on an unforgettable journey aboard our luxury yacht. Experience the ultimate in maritime luxury with a fully crewed vessel, gourmet catering, and access to exclusive Mediterranean destinations. Perfect for special occasions or luxury vacations.",
  highlights: [
    "Professional Crew",
    "Gourmet Catering",
    "Water Sports Equipment",
    "Premium Bar Service",
    "Sunset Cruise Option",
    "Private Chef",
    "Personalized Itinerary",
    "VIP Concierge",
  ],
  images: [
    "/images/leisure/yacht-1.jpg",
    "/images/leisure/yacht-2.jpg",
    "/images/leisure/yacht-3.jpg",
    "/images/leisure/yacht-4.jpg",
  ],
  provider: {
    name: "Emma Williams",
    image: "/images/connect/profile-3.jpg",
    rating: 4.9,
    reviews: 92,
    response: "Usually responds within 1 hour",
    experience: "10+ years",
    languages: ["English", "French", "Italian"],
  },
  details: {
    duration: "Full Day (8 hours)",
    groupSize: "Up to 12 guests",
    includes: [
      "Professional captain and crew",
      "Fuel and docking fees",
      "Gourmet lunch and snacks",
      "Premium beverages",
      "Water sports equipment",
      "Towels and amenities",
    ],
    excludes: [
      "Additional hours beyond 8 hours",
      "Special catering requests",
      "Transportation to/from marina",
      "Gratuities",
    ],
  },
  destinations: [
    {
      name: "Saint-Tropez Bay",
      description: "Explore the glamorous French Riviera coastline",
      image: "/images/leisure/destination-1.jpg",
    },
    {
      name: "Porquerolles Islands",
      description: "Discover pristine beaches and crystal-clear waters",
      image: "/images/leisure/destination-2.jpg",
    },
    {
      name: "Calanques National Park",
      description: "Visit dramatic limestone cliff formations",
      image: "/images/leisure/destination-3.jpg",
    },
  ],
  reviews: [
    {
      id: "1",
      author: "James Anderson",
      rating: 5,
      date: "1 week ago",
      content: "An absolutely incredible experience. The crew was professional, the yacht was immaculate, and the entire day was perfectly organized.",
      image: "/images/reviews/review-1.jpg",
    },
    {
      id: "2",
      author: "Isabella Martinez",
      rating: 5,
      date: "2 weeks ago",
      content: "Worth every penny! The service was impeccable and the destinations were breathtaking. Will definitely book again.",
      image: "/images/reviews/review-2.jpg",
    },
  ],
  availableDates: [
    "2025-09-07",
    "2025-09-08",
    "2025-09-10",
    "2025-09-11",
    "2025-09-12",
  ],
};

export default function LeisureDetailPage() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative h-[70vh] w-full">
        <Image
          src={experience.images[selectedImage]}
          alt={experience.title}
          className="object-cover"
          fill
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 glass border-b border-white/20">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <button onClick={() => window.history.back()} className="text-white">
                Back
              </button>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="glass rounded-full p-2"
                >
                  {isFavorite ? (
                    <HeartIconSolid className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 text-white" />
                  )}
                </button>
                <button className="glass rounded-full p-2">
                  <ShareIcon className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Navigation */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="glass rounded-full p-2">
            <div className="flex items-center space-x-2">
              {experience.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    selectedImage === index ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                {experience.title}
              </h1>
              <div className="mt-2 flex items-center space-x-2 text-gray-500">
                <MapPinIcon className="h-5 w-5" />
                <span>{experience.location}</span>
              </div>
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <span>{experience.details.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UsersIcon className="h-5 w-5 text-gray-400" />
                  <span>{experience.details.groupSize}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <StarIcon className="h-5 w-5 text-gray-400" />
                  <span>{experience.provider.rating} ({experience.provider.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">About the Experience</h2>
              <p className="text-gray-600 leading-relaxed">
                {experience.description}
              </p>
            </div>

            {/* Highlights */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Experience Highlights</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {experience.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-center space-x-2 text-gray-600"
                  >
                    <ChevronRightIcon className="h-4 w-4 text-blue-500" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">What's Included</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Included:</h3>
                  {experience.details.includes.map((item) => (
                    <div
                      key={item}
                      className="flex items-center space-x-2 text-gray-600"
                    >
                      <ChevronRightIcon className="h-4 w-4 text-green-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Not Included:</h3>
                  {experience.details.excludes.map((item) => (
                    <div
                      key={item}
                      className="flex items-center space-x-2 text-gray-600"
                    >
                      <ChevronRightIcon className="h-4 w-4 text-red-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Destinations */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Destinations</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {experience.destinations.map((destination) => (
                  <div key={destination.name} className="group relative">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                      <Image
                        src={destination.image}
                        alt={destination.name}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        fill
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-lg font-medium text-white">
                          {destination.name}
                        </h3>
                        <p className="mt-1 text-sm text-white/80">
                          {destination.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Guest Reviews</h2>
              <div className="space-y-6">
                {experience.reviews.map((review) => (
                  <div key={review.id} className="card p-6">
                    <div className="flex items-start space-x-4">
                      <div className="relative h-12 w-12">
                        <Image
                          src={review.image}
                          alt={review.author}
                          className="rounded-full object-cover"
                          fill
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">
                            {review.author}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {review.date}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIconSolid
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-gray-600">{review.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {experience.price}
                </h3>
                <div className="flex items-center">
                  <StarIconSolid className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1 text-sm text-gray-600">
                    {experience.provider.rating}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Date
                  </label>
                  <select className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    {experience.availableDates.map((date) => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Guests
                  </label>
                  <select className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button className="btn-primary w-full">Book Now</button>
                <button className="btn-secondary w-full">Contact Host</button>
              </div>

              <p className="mt-4 text-center text-sm text-gray-500">
                Free cancellation up to 24 hours before the experience
              </p>
            </div>

            {/* Provider Card */}
            <div className="card p-6">
              <div className="flex items-center space-x-4">
                <div className="relative h-16 w-16">
                  <Image
                    src={experience.provider.image}
                    alt={experience.provider.name}
                    className="rounded-full object-cover"
                    fill
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {experience.provider.name}
                  </h3>
                  <div className="mt-1 flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIconSolid
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(experience.provider.rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      ({experience.provider.reviews} reviews)
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {experience.provider.response}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Languages</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {experience.provider.languages.map((language) => (
                    <span
                      key={language}
                      className="glass rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-900"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900">Location</h3>
              <div className="mt-4">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
                  {/* Map would go here */}
                  <div className="h-full w-full bg-gray-200" />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Exact location provided after booking
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}