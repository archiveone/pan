'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Calendar,
  Filter,
  X,
  ChevronDown,
  Clock,
  Sparkles,
  History,
  TrendingUp,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePickerWithRange } from '@/components/ui/date-picker-range';
import { LocationCombobox } from '@/components/search/LocationCombobox';
import { PriceRangeSlider } from '@/components/search/PriceRangeSlider';

interface SearchBarProps {
  type: 'property' | 'service' | 'leisure';
  variant?: 'default' | 'minimal' | 'expanded';
  className?: string;
  initialFilters?: SearchFilters;
  onSearch?: (filters: SearchFilters) => void;
}

interface SearchFilters {
  query: string;
  location?: {
    type: 'city' | 'postcode' | 'area';
    value: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  dateRange?: {
    from: Date;
    to: Date;
  };
  price?: {
    min: number;
    max: number;
    currency: string;
  };
  propertyType?: string[];
  serviceCategory?: string[];
  leisureType?: string[];
  features?: string[];
  sortBy?: string;
  page?: number;
  limit?: number;
}

interface SearchSuggestion {
  id: string;
  type: 'recent' | 'trending' | 'popular' | 'location' | 'category';
  text: string;
  subtext?: string;
  icon?: React.ReactNode;
}

export function SearchBar({
  type,
  variant = 'default',
  className,
  initialFilters,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(
    initialFilters || {
      query: '',
      page: 1,
      limit: 20,
    }
  );
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const debouncedSearch = useDebounce(filters.query, 300);

  useOnClickOutside(searchRef, () => setIsOpen(false));

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      fetchSuggestions();
    }
  }, [debouncedSearch]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      // API call to fetch search suggestions
      const response = await fetch(
        \`/api/search/suggestions?\${new URLSearchParams({
          type,
          query: filters.query,
          ...(filters.location && { location: filters.location.value }),
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

  const handleSearch = () => {
    // Save to recent searches
    const updatedRecent = [
      filters.query,
      ...recentSearches.filter((s) => s !== filters.query),
    ].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

    // Update URL params
    const params = new URLSearchParams(searchParams);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (typeof value === 'object') {
          params.set(key, JSON.stringify(value));
        } else {
          params.set(key, String(value));
        }
      } else {
        params.delete(key);
      }
    });

    // Navigate or callback
    if (onSearch) {
      onSearch(filters);
    } else {
      router.push(\`/\${type}/search?\${params.toString()}\`);
    }

    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      page: 1,
      limit: 20,
    });
    setActiveFilters([]);
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset page when filters change
    }));

    // Update active filters list
    const active: string[] = [];
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        switch (key) {
          case 'location':
            active.push(\`Location: \${(value as any).value}\`);
            break;
          case 'dateRange':
            active.push(
              \`Dates: \${(value as any).from.toLocaleDateString()} - \${(value as any).to.toLocaleDateString()}\`
            );
            break;
          case 'price':
            active.push(
              \`Price: \${(value as any).min} - \${(value as any).max} \${
                (value as any).currency
              }\`
            );
            break;
          default:
            if (Array.isArray(value)) {
              value.forEach((v) => active.push(\`\${key}: \${v}\`));
            }
        }
      }
    });
    setActiveFilters(active);
  };

  return (
    <div
      ref={searchRef}
      className={cn(
        'relative w-full max-w-2xl',
        variant === 'minimal' && 'max-w-xl',
        variant === 'expanded' && 'max-w-4xl',
        className
      )}
    >
      {/* Main Search Input */}
      <div className="relative">
        <Input
          value={filters.query}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, query: e.target.value }));
            setIsOpen(true);
          }}
          placeholder={
            type === 'property'
              ? 'Search for properties...'
              : type === 'service'
              ? 'Search for services...'
              : 'Search for activities and experiences...'
          }
          className="pr-24"
        />
        <div className="absolute right-0 top-0 flex h-full items-center pr-2">
          {filters.query && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-1"
              onClick={() =>
                setFilters((prev) => ({ ...prev, query: '' }))
              }
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {filter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  // Remove filter logic
                }}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-6"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full z-50 mt-2 w-full rounded-lg border bg-background shadow-lg"
          >
            <Command>
              <CommandList>
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <>
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <CommandGroup heading="Recent Searches">
                        {recentSearches.map((search) => (
                          <CommandItem
                            key={search}
                            onSelect={() => {
                              setFilters((prev) => ({
                                ...prev,
                                query: search,
                              }));
                              handleSearch();
                            }}
                          >
                            <History className="mr-2 h-4 w-4" />
                            {search}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {/* Trending Searches */}
                    <CommandGroup heading="Trending">
                      {suggestions
                        .filter((s) => s.type === 'trending')
                        .map((suggestion) => (
                          <CommandItem
                            key={suggestion.id}
                            onSelect={() => {
                              setFilters((prev) => ({
                                ...prev,
                                query: suggestion.text,
                              }));
                              handleSearch();
                            }}
                          >
                            <TrendingUp className="mr-2 h-4 w-4" />
                            {suggestion.text}
                            {suggestion.subtext && (
                              <span className="ml-2 text-sm text-muted-foreground">
                                {suggestion.subtext}
                              </span>
                            )}
                          </CommandItem>
                        ))}
                    </CommandGroup>

                    {/* Popular Locations */}
                    <CommandGroup heading="Popular Locations">
                      {suggestions
                        .filter((s) => s.type === 'location')
                        .map((suggestion) => (
                          <CommandItem
                            key={suggestion.id}
                            onSelect={() => {
                              setFilters((prev) => ({
                                ...prev,
                                location: {
                                  type: 'city',
                                  value: suggestion.text,
                                },
                              }));
                              handleSearch();
                            }}
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            {suggestion.text}
                          </CommandItem>
                        ))}
                    </CommandGroup>

                    {/* Categories */}
                    <CommandGroup heading="Categories">
                      {suggestions
                        .filter((s) => s.type === 'category')
                        .map((suggestion) => (
                          <CommandItem
                            key={suggestion.id}
                            onSelect={() => {
                              setFilters((prev) => ({
                                ...prev,
                                query: suggestion.text,
                              }));
                              handleSearch();
                            }}
                          >
                            {suggestion.icon}
                            {suggestion.text}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="mt-4">
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Search Filters</SheetTitle>
            <SheetDescription>
              Refine your search with advanced filters
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Location Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <LocationCombobox
                value={filters.location?.value}
                onChange={(location) =>
                  updateFilters({ location })
                }
              />
            </div>

            {/* Date Range Filter */}
            {type !== 'property' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Dates</label>
                <DatePickerWithRange
                  value={filters.dateRange}
                  onChange={(dateRange) =>
                    updateFilters({ dateRange })
                  }
                />
              </div>
            )}

            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <PriceRangeSlider
                value={filters.price}
                onChange={(price) => updateFilters({ price })}
                currency={filters.price?.currency || 'GBP'}
              />
            </div>

            {/* Type-specific Filters */}
            {type === 'property' && (
              <div className="space-y-4">
                {/* Property Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Property Type</label>
                  {/* Property type selection component */}
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Features</label>
                  {/* Features selection component */}
                </div>
              </div>
            )}

            {type === 'service' && (
              <div className="space-y-4">
                {/* Service Categories */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categories</label>
                  {/* Service categories selection component */}
                </div>

                {/* Service Features */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Features</label>
                  {/* Service features selection component */}
                </div>
              </div>
            )}

            {type === 'leisure' && (
              <div className="space-y-4">
                {/* Leisure Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  {/* Leisure type selection component */}
                </div>

                {/* Activities */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Activities</label>
                  {/* Activities selection component */}
                </div>
              </div>
            )}

            {/* Sort Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              {/* Sort options selection component */}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
              <Button onClick={handleSearch}>Apply Filters</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}