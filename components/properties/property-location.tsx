'use client';

import { useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Replace with your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface PropertyLocationProps {
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export function PropertyLocation({ location, coordinates }: PropertyLocationProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [coordinates.longitude, coordinates.latitude],
      zoom: 14,
      interactive: true,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'top-right'
    );

    // Add marker
    marker.current = new mapboxgl.Marker({
      color: '#0066FF',
      scale: 1.2,
    })
      .setLngLat([coordinates.longitude, coordinates.latitude])
      .addTo(map.current);

    // Add popup
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 25,
    })
      .setHTML(`
        <div class="p-2">
          <strong>Location</strong>
          <p class="text-sm">${location}</p>
        </div>
      `);

    marker.current.setPopup(popup);

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [coordinates, location]);

  const handleGetDirections = () => {
    const { latitude, longitude } = coordinates;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
      '_blank'
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Location Text */}
          <p className="text-muted-foreground">{location}</p>

          {/* Map Container */}
          <div 
            ref={mapContainer} 
            className="w-full h-[400px] rounded-lg overflow-hidden"
          />

          {/* Get Directions Button */}
          <Button 
            onClick={handleGetDirections}
            className="w-full"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Get Directions
          </Button>

          {/* Location Features */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold">Transport</div>
              <div className="text-sm text-muted-foreground">5 min walk</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold">Schools</div>
              <div className="text-sm text-muted-foreground">3 nearby</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold">Shopping</div>
              <div className="text-sm text-muted-foreground">10 min walk</div>
            </div>
          </div>

          {/* Location Notice */}
          <p className="text-sm text-muted-foreground text-center">
            The exact location is provided after booking confirmation
          </p>
        </div>
      </CardContent>
    </Card>
  );
}