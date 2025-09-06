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
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

// Sample data - would come from API
const service = {
  id: "1",
  title: "Premium Interior Design Service",
  price: "€150/hour",
  location: "Paris, France",
  description: "Expert interior design services tailored to luxury properties. Our team of experienced designers creates bespoke solutions that blend elegance with functionality, ensuring each space tells its own unique story.",
  expertise: [
    "Residential Design",
    "Commercial Spaces",
    "Luxury Homes",
    "Hotel Design",
    "Space Planning",
    "Custom Furniture",
    "Color Consultation",
    "Lighting Design",
  ],
  images: [
    "/images/services/interior-1.jpg",
    "/images/services/interior-2.jpg",
    "/images/services/interior-3.jpg",
    "/images/services/interior-4.jpg",
  ],
  provider: {
    name: "Michael Chen",
    image: "/images/connect/profile-2.jpg",
    rating: 4.9,
    reviews: 156,
    response: "Usually responds within 30 minutes",
    experience: "15+ years",
    languages: ["English", "French", "Mandarin"],
  },
  portfolio: [
    {
      title: "Luxury Apartment Renovation",
      location: "16th Arrondissement, Paris",
      image: "/images/services/portfolio-1.jpg",
    },
    {
      title: "Boutique Hotel Design",
      location: "Saint-Germain-des-Prés, Paris",
      image: "/images/services/portfolio-2.jpg",
    },
    {
      title: "Historic Mansion Restoration",
      location: "Loire Valley",
      image: "/images/services/portfolio-3.jpg",
    },
  ],
  reviews: [
    {
      id: "1",
      author: "Sophie Martin",
      rating: 5,
      date: "2 weeks ago",
      content: "Exceptional service and attention to detail. Michael transformed our space beyond our expectations.",
      image: "/images/reviews/review-1.jpg",
    },
    {
      id: "2",
      author: "Jean-Pierre Dubois",
      rating: 5,
      date: "1 month ago",
      content: "Professional, creative, and a pleasure to work with. The results were stunning.",
      image: "/images/reviews/review-2.jpg",
    },
  ],
};

export default function ServiceDetailPage() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative h-[70vh] w-full">
        <Image
          src={service.images[selectedImage]}
          alt={service.title}
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
              {service.images.map((_, index) => (
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
                {service.title}
              </h1>
              <div className="mt-2 flex items-center space-x-2 text-gray-500">
                <MapPinIcon className="h-5 w-5" />
                <span>{service.location}</span>
              </div>
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <span>{service.provider.experience}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <StarIcon className="h-5 w-5 text-gray-400" />
                  <span>{service.provider.rating} ({service.provider.reviews} reviews)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CurrencyEuroIcon className="h-5 w-5 text-gray-400" />
                  <span>{service.price}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">About the Service</h2>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Expertise */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Areas of Expertise</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {service.expertise.map((item) => (
                  <div
                    key={item}
                    className="flex items-center space-x-2 text-gray-600"
                  >
                    <ChevronRightIcon className="h-4 w-4 text-blue-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Portfolio</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {service.portfolio.map((item) => (
                  <div key={item.title} className="group relative">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                      <Image
                        src={item.image}
                        alt={item.title}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        fill
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-lg font-medium text-white">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-white/80">
                          {item.location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Client Reviews</h2>
              <div className="space-y-6">
                {service.reviews.map((review) => (
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
            {/* Provider Card */}
            <div className="card p-6">
              <div className="flex items-center space-x-4">
                <div className="relative h-16 w-16">
                  <Image
                    src={service.provider.image}
                    alt={service.provider.name}
                    className="rounded-full object-cover"
                    fill
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {service.provider.name}
                  </h3>
                  <div className="mt-1 flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIconSolid
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(service.provider.rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      ({service.provider.reviews} reviews)
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {service.provider.response}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Languages</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {service.provider.languages.map((language) => (
                    <span
                      key={language}
                      className="glass rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-900"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <button className="btn-primary w-full">Book Consultation</button>
                <button className="btn-secondary w-full">Send Message</button>
              </div>
            </div>

            {/* Booking Calendar */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Check Availability
              </h3>
              <div className="mt-4">
                {/* Calendar component would go here */}
                <div className="h-64 w-full rounded-lg bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}