"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  UserGroupIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

// Sample data - would come from API
const property = {
  id: "1",
  title: "Luxury Penthouse with Sea View",
  price: 1250000,
  location: "Monaco, French Riviera",
  description: "Stunning penthouse apartment with panoramic sea views, featuring premium finishes and exclusive amenities. This exceptional property offers the perfect blend of luxury and comfort in one of the most prestigious locations.",
  features: [
    "3 Bedrooms",
    "2.5 Bathrooms",
    "180 m² Living Space",
    "50 m² Terrace",
    "2 Parking Spaces",
    "24/7 Concierge",
    "Private Pool",
    "Smart Home System",
  ],
  images: [
    "/images/properties/penthouse-1.jpg",
    "/images/properties/penthouse-2.jpg",
    "/images/properties/penthouse-3.jpg",
    "/images/properties/penthouse-4.jpg",
  ],
  agent: {
    name: "Sarah Johnson",
    image: "/images/connect/profile-1.jpg",
    rating: 4.9,
    reviews: 128,
    response: "Usually responds within 1 hour",
  },
  amenities: [
    "Air Conditioning",
    "Floor Heating",
    "Wine Cellar",
    "Home Theater",
    "Gym Access",
    "Storage Room",
  ],
  nearbyPlaces: [
    "Monte Carlo Casino (5 min)",
    "Port Hercule (8 min)",
    "Larvotto Beach (10 min)",
    "Monaco Train Station (12 min)",
  ],
};

export default function PropertyDetailPage() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative h-[70vh] w-full">
        <Image
          src={property.images[selectedImage]}
          alt={property.title}
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
              {property.images.map((_, index) => (
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
                {property.title}
              </h1>
              <div className="mt-2 flex items-center space-x-2 text-gray-500">
                <MapPinIcon className="h-5 w-5" />
                <span>{property.location}</span>
              </div>
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <HomeIcon className="h-5 w-5 text-gray-400" />
                  <span>180 m²</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="h-5 w-5 text-gray-400" />
                  <span>3 Bedrooms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CurrencyEuroIcon className="h-5 w-5 text-gray-400" />
                  <span>€{property.price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Description</h2>
              <p className="text-gray-600 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Features</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {property.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center space-x-2 text-gray-600"
                  >
                    <ChevronRightIcon className="h-4 w-4 text-blue-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Location</h2>
              <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-100">
                {/* Map would go here */}
                <div className="h-full w-full bg-gray-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {property.nearbyPlaces.map((place) => (
                  <div
                    key={place}
                    className="flex items-center space-x-2 text-gray-600"
                  >
                    <MapPinIcon className="h-4 w-4 text-blue-500" />
                    <span>{place}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            <div className="card p-6">
              <div className="flex items-center space-x-4">
                <div className="relative h-16 w-16">
                  <Image
                    src={property.agent.image}
                    alt={property.agent.name}
                    className="rounded-full object-cover"
                    fill
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {property.agent.name}
                  </h3>
                  <div className="mt-1 flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(property.agent.rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      ({property.agent.reviews} reviews)
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {property.agent.response}
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <button className="btn-primary w-full">Contact Agent</button>
                <button className="btn-secondary w-full">Schedule Viewing</button>
              </div>
            </div>

            {/* Amenities */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900">Amenities</h3>
              <div className="mt-4 grid grid-cols-1 gap-3">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center space-x-2 text-gray-600"
                  >
                    <ChevronRightIcon className="h-4 w-4 text-blue-500" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Properties */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Similar Properties
              </h3>
              {/* Would map through similar properties here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}