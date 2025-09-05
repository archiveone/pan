'use client';

import { useState, useEffect } from 'react';
import { Check, MapPin, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface LocationComboboxProps {
  value?: string;
  onChange: (location: {
    type: 'city' | 'postcode' | 'area';
    value: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }) => void;
  className?: string;
}

interface LocationSuggestion {
  id: string;
  type: 'city' | 'postcode' | 'area';
  value: string;
  display: string;
  region?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export function LocationCombobox({
  value,
  onChange,
  className,
}: LocationComboboxProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value || '');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [recentLocations, setRecentLocations] = useState<LocationSuggestion[]>([]);
  const [userLocation, setUserLocation] = useState<LocationSuggestion | null>(null);

  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    // Load recent locations from localStorage
    const saved = localStorage.getItem('recentLocations');
    if (saved) {
      setRecentLocations(JSON.parse(saved));
    }

    // Get user's current location if permitted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              \`/api/geocode/reverse?\${new URLSearchParams({
                lat: position.coords.latitude.toString(),
                lng: position.coords.longitude.toString(),
              })}\`
            );
            const data = await response.json();
            setUserLocation(data);
          } catch (error) {
            console.error('Error getting location:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (debouncedInput.length >= 2) {
      fetchSuggestions();
    }
  }, [debouncedInput]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        \`/api/locations/suggest?\${new URLSearchParams({
          query: debouncedInput,
        })}\`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (location: LocationSuggestion) => {
    setInput(location.display);
    onChange({
      type: location.type,
      value: location.value,
      coordinates: location.coordinates,
    });
    setOpen(false);

    // Save to recent locations
    const updated = [
      location,
      ...recentLocations.filter((l) => l.id !== location.id),
    ].slice(0, 5);
    setRecentLocations(updated);
    localStorage.setItem('recentLocations', JSON.stringify(updated));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground',
            className
          )}
        >
          {value ? (
            <span className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              {value}
            </span>
          ) : (
            <span className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Select location...
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Search for a location..."
            value={input}
            onValueChange={setInput}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="py-6 text-center text-sm">
                  No locations found.
                </div>
              )}
            </CommandEmpty>

            {/* Current Location */}
            {userLocation && (
              <CommandGroup heading="Current Location">
                <CommandItem
                  value={userLocation.value}
                  onSelect={() => handleSelect(userLocation)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{userLocation.display}</span>
                  {value === userLocation.value && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              </CommandGroup>
            )}

            {/* Recent Locations */}
            {recentLocations.length > 0 && (
              <CommandGroup heading="Recent Locations">
                {recentLocations.map((location) => (
                  <CommandItem
                    key={location.id}
                    value={location.value}
                    onSelect={() => handleSelect(location)}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{location.display}</span>
                    {location.region && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {location.region}
                      </span>
                    )}
                    {value === location.value && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Search Results */}
            {suggestions.length > 0 && (
              <CommandGroup heading="Suggestions">
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion.id}
                    value={suggestion.value}
                    onSelect={() => handleSelect(suggestion)}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{suggestion.display}</span>
                      {(suggestion.region || suggestion.country) && (
                        <span className="text-sm text-muted-foreground">
                          {[suggestion.region, suggestion.country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      )}
                    </div>
                    {value === suggestion.value && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}