"use client";

import { Property } from '@/lib/types/property';
import { PropertyCard } from './PropertyCard';
import { cn } from '@/lib/utils';

interface PropertyGridProps {
  properties: Property[];
  onFavorite?: (propertyId: string) => void;
  favoritedProperties?: Set<string>;
  className?: string;
}

export function PropertyGrid({
  properties,
  onFavorite,
  favoritedProperties,
  className,
}: PropertyGridProps) {
  if (!properties.length) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No properties found
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onFavorite={onFavorite}
          isFavorited={favoritedProperties?.has(property.id)}
        />
      ))}
    </div>
  );
}