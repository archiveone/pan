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
    <div className="group relative">
      <div className="aspect-h-3 aspect-w-4 overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={imageUrl}
          alt={title}
          className="object-cover object-center"
          width={800}
          height={600}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {isFeatured && (
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
              Featured
            </span>
          </div>
        )}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute right-4 top-4 rounded-full bg-white p-2 shadow-md hover:bg-gray-100"
        >
          {isFavorite ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            <Link href={`/properties/${id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {title}
            </Link>
          </h3>
          <p className="text-lg font-medium text-blue-600">€{price.toLocaleString()}</p>
        </div>
        <p className="text-sm text-gray-500">{location}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <span className="font-medium">{bedrooms}</span> beds
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">{bathrooms}</span> baths
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">{size}</span> m²
          </div>
        </div>
      </div>
    </div>
  );
}