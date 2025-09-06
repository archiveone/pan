"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useState } from "react";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  imageUrl: string;
  isFeatured?: boolean;
}

export function PropertyCard({
  id,
  title,
  price,
  location,
  bedrooms,
  bathrooms,
  size,
  imageUrl,
  isFeatured,
}: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group relative animate-fade-up">
      {/* Card with Apple-like glass morphism */}
      <div className="card overflow-hidden">
        {/* Image container */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
          <Image
            src={imageUrl}
            alt={title}
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Featured badge */}
          {isFeatured && (
            <div className="absolute left-4 top-4">
              <span className="glass px-3 py-1 text-xs font-medium text-gray-900">
                Featured
              </span>
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute right-4 top-4 glass rounded-full p-2 transition-apple"
          >
            {isFavorite ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-3">
            {/* Title and Price */}
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                <Link href={`/properties/${id}`} className="hover:underline">
                  {title}
                </Link>
              </h3>
              <p className="text-lg font-medium text-gray-900">
                €{price.toLocaleString()}
              </p>
            </div>

            {/* Location */}
            <p className="text-sm text-gray-500">{location}</p>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span className="font-medium">{bedrooms}</span>
                <span>bed{bedrooms !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{bathrooms}</span>
                <span>bath{bathrooms !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{size}</span>
                <span>m²</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center gap-3">
            <button className="btn-primary flex-1">View Details</button>
            <button className="btn-secondary flex-1">Contact Agent</button>
          </div>
        </div>
      </div>
    </div>
  );
}