'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListingCard } from '@/components/listings/listing-card';
import { useToast } from '@/components/ui/use-toast';

interface ListingsViewProps {
  initialListings: any[];
  totalListings: number;
  currentUser?: {
    id: string;
    favorites: string[];
  };
  categories: { label: string; value: string; }[];
  types: {
    [key: string]: { label: string; value: string; }[];
  };
  popularLocations: string[];
  popularTags: string[];
  initialFilters: {
    category?: string;
    type?: string;
    minPrice?: string;
    maxPrice?: string;
    location?: string;
    tags?: string[];
  };
}

export const ListingsView = ({
  initialListings,
  totalListings,
  currentUser,
  categories,
  types,
  popularLocations,
  popularTags,
  initialFilters,
}: ListingsViewProps) => {
  const [listings, setListings] = useState(initialListings);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ref, inView] = useInView();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Load more listings when scrolling
  useEffect(() => {
    if (inView && nextCursor) {
      fetchListings(nextCursor);
    }
  }, [inView]);

  const fetchListings = async (cursor?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.location) params.append('location', filters.location);
      if (filters.tags?.length) params.append('tags', filters.tags.join(','));

      const response = await axios.get(`/api/listings?${params.toString()}`);
      const { listings: newListings, nextCursor: newCursor } = response.data;

      if (cursor) {
        setListings(prev => [...prev, ...newListings]);
      } else {
        setListings(newListings);
      }
      setNextCursor(newCursor);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load listings. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, location: searchQuery }));
    updateUrl({ ...filters, location: searchQuery });
    fetchListings();
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateUrl(newFilters);
    fetchListings();
  };

  const updateUrl = (params: typeof filters) => {
    const newParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          newParams.append(key, value.join(','));
        } else {
          newParams.append(key, value.toString());
        }
      }
    });
    router.push(`/listings?${newParams.toString()}`, { scroll: false });
  };

  const handleCreateListing = () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    router.push('/listings/create');
  };

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Browse Listings</h1>
        <Button onClick={handleCreateListing}>
          <Plus className="h-4 w-4 mr-2" />
          Create Listing
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="flex gap-2">
            <Input
              placeholder="Search by location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-medium mb-2">Category</h3>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type Filter */}
                {filters.category && (
                  <div>
                    <h3 className="font-medium mb-2">Type</h3>
                    <Select
                      value={filters.type}
                      onValueChange={(value) => handleFilterChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {types[filters.category].map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Price Range */}
                <div>
                  <h3 className="font-medium mb-2">Price Range</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    />
                  </div>
                </div>

                {/* Popular Locations */}
                <div>
                  <h3 className="font-medium mb-2">Popular Locations</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularLocations.map((location) => (
                      <Badge
                        key={location}
                        variant={filters.location === location ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleFilterChange('location', location)}
                      >
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Popular Tags */}
                <div>
                  <h3 className="font-medium mb-2">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={filters.tags?.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const newTags = filters.tags?.includes(tag)
                            ? filters.tags.filter(t => t !== tag)
                            : [...(filters.tags || []), tag];
                          handleFilterChange('tags', newTags);
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters */}
      {Object.values(filters).some(Boolean) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            if (Array.isArray(value) && !value.length) return null;
            
            return (
              <Badge
                key={key}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleFilterChange(key, undefined)}
              >
                {key}: {Array.isArray(value) ? value.join(', ') : value}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilters({});
              updateUrl({});
              fetchListings();
            }}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            data={listing}
            currentUser={currentUser}
          />
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Load More Trigger */}
      {nextCursor && <div ref={ref} className="h-1" />}

      {/* Empty State */}
      {!loading && listings.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No listings found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search criteria
          </p>
        </div>
      )}
    </div>
  );
};