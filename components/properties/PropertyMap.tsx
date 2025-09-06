"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PropertyMapProps {
  center: {
    lat: number;
    lng: number;
  };
  markers?: Array<{
    id: string;
    position: {
      lat: number;
      lng: number;
    };
    title: string;
    price: string;
    type: string;
    listingType: string;
    image?: string;
  }>;
  zoom?: number;
  className?: string;
  onMarkerClick?: (id: string) => void;
}

export function PropertyMap({
  center,
  markers = [],
  zoom = 14,
  className,
  onMarkerClick,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places'],
    });

    loader.load().then(() => {
      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      setMap(mapInstance);
      setInfoWindow(new google.maps.InfoWindow());
    });
  }, [center, zoom]);

  useEffect(() => {
    if (!map || !infoWindow) return;

    // Clear existing markers
    mapMarkers.forEach((marker) => marker.setMap(null));

    // Create new markers
    const newMarkers = markers.map((marker) => {
      const mapMarker = new google.maps.Marker({
        position: marker.position,
        map,
        title: marker.title,
        animation: google.maps.Animation.DROP,
      });

      const content = `
        <div class="min-w-[200px] p-2">
          ${marker.image ? `
            <img src="${marker.image}" alt="${marker.title}" class="mb-2 h-32 w-full object-cover rounded" />
          ` : ''}
          <h3 class="font-semibold">${marker.title}</h3>
          <p class="text-sm text-muted-foreground">${marker.type} - ${marker.listingType}</p>
          <p class="mt-1 text-lg font-bold">${marker.price}</p>
          <button
            class="mt-2 w-full rounded bg-primary px-3 py-2 text-sm text-primary-foreground"
            onclick="window.location.href='/properties/${marker.id}'"
          >
            View Details
          </button>
        </div>
      `;

      mapMarker.addListener('click', () => {
        infoWindow.setContent(content);
        infoWindow.open(map, mapMarker);
        onMarkerClick?.(marker.id);
      });

      return mapMarker;
    });

    setMapMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach((marker) => bounds.extend(marker.getPosition()!));
      map.fitBounds(bounds);
    }

    return () => {
      newMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [map, markers, infoWindow, onMarkerClick]);

  return (
    <div className={cn('relative rounded-lg', className)}>
      <div ref={mapRef} className="h-full w-full min-h-[400px] rounded-lg" />
      <div className="absolute bottom-4 right-4 space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => map?.setZoom((map.getZoom() || zoom) + 1)}
        >
          +
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => map?.setZoom((map.getZoom() || zoom) - 1)}
        >
          -
        </Button>
      </div>
    </div>
  );
}