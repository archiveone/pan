import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import debounce from 'lodash/debounce';
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  X,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SearchFilters {
  query: string;
  location: string;
  category: string;
  type: string;
  priceRange: [number, number];
  sortBy: string;
  amenities: string[];
  features: string[];
  verifiedOnly: boolean;
  instantBook: boolean;
  availability: string;
  rating: number;
}

interface AdvancedSearchProps {
  type: 'properties' | 'services' | 'leisure';
  onSearch: (filters: SearchFilters) => void;
}

const defaultFilters: SearchFilters = {
  query: '',
  location: '',
  category: 'all',
  type: 'all',
  priceRange: [0, 10000],
  sortBy: 'relevance',
  amenities: [],
  features: [],
  verifiedOnly: false,
  instantBook: false,
  availability: 'anytime',
  rating: 0,
};

const propertyTypes = [
  'Apartment',
  'House',
  'Villa',
  'Penthouse',
  'Studio',
  'Commercial',
];

const serviceTypes = [
  'Trades',
  'Professional',
  'Home Services',
  'Health',
  'Education',
  'Technology',
];

const leisureTypes = [
  'Events',
  'Activities',
  'Tours',
  'Rentals',
  'Experiences',
  'Dining',
];

const amenities = [
  'Parking',
  'WiFi',
  'Pool',
  'Gym',
  'Security',
  'Elevator',
  'Air Conditioning',
  'Heating',
];

const features = [
  'Pet Friendly',
  'Wheelchair Accessible',
  'Family Friendly',
  'Business Ready',
  'Eco Friendly',
  'Luxury',
];

export function AdvancedSearch({ type, onSearch }: AdvancedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Initialize filters from URL params
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const updatedFilters = { ...defaultFilters };

    params.forEach((value, key) => {
      if (key === 'priceRange') {
        updatedFilters.priceRange = value.split(',').map(Number) as [number, number];
      } else if (key === 'amenities' || key === 'features') {
        updatedFilters[key] = value.split(',');
      } else if (key === 'verifiedOnly' || key === 'instantBook') {
        updatedFilters[key] = value === 'true';
      } else if (key === 'rating') {
        updatedFilters[key] = Number(value);
      } else {
        updatedFilters[key as keyof SearchFilters] = value;
      }
    });

    setFilters(updatedFilters);
    updateActiveFilters(updatedFilters);
  }, [searchParams]);

  // Update URL with filters
  const updateURL = useCallback(
    debounce((newFilters: SearchFilters) => {
      const params = new URLSearchParams();

      Object.entries(newFilters).forEach(([key, value]) => {
        if (
          (Array.isArray(value) && value.length > 0) ||
          (typeof value === 'boolean' && value) ||
          (typeof value === 'number' && value > 0) ||
          (typeof value === 'string' && value && value !== 'all')
        ) {
          params.set(key, Array.isArray(value) ? value.join(',') : String(value));
        }
      });

      router.push(\`?\${params.toString()}\`);
    }, 500),
    [router]
  );

  const updateActiveFilters = (currentFilters: SearchFilters) => {
    const active: string[] = [];

    if (currentFilters.query) active.push(\`Search: \${currentFilters.query}\`);
    if (currentFilters.location) active.push(\`Location: \${currentFilters.location}\`);
    if (currentFilters.category !== 'all') active.push(\`Category: \${currentFilters.category}\`);
    if (currentFilters.type !== 'all') active.push(\`Type: \${currentFilters.type}\`);
    if (currentFilters.amenities.length > 0) active.push(\`Amenities: \${currentFilters.amenities.length}\`);
    if (currentFilters.features.length > 0) active.push(\`Features: \${currentFilters.features.length}\`);
    if (currentFilters.verifiedOnly) active.push('Verified Only');
    if (currentFilters.instantBook) active.push('Instant Book');
    if (currentFilters.availability !== 'anytime') active.push(\`Available: \${currentFilters.availability}\`);
    if (currentFilters.rating > 0) active.push(\`Rating: \${currentFilters.rating}+\`);

    setActiveFilters(active);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateActiveFilters(newFilters);
    updateURL(newFilters);
    onSearch(newFilters);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    updateActiveFilters(defaultFilters);
    updateURL(defaultFilters);
    onSearch(defaultFilters);
    setIsFiltersOpen(false);
  };

  const getTypeOptions = () => {
    switch (type) {
      case 'properties':
        return propertyTypes;
      case 'services':
        return serviceTypes;
      case 'leisure':
        return leisureTypes;
      default:
        return [];
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={`Search ${type}...`}
                  className="pl-10"
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  className="pl-10"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
            </div>
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilters.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>Search Filters</SheetTitle>
                </SheetHeader>

                <div className="py-6">
                  <Accordion type="single" collapsible className="space-y-4">
                    {/* Type Filter */}
                    <AccordionItem value="type">
                      <AccordionTrigger>Type</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-2">
                          {getTypeOptions().map((option) => (
                            <Button
                              key={option}
                              variant={filters.type === option ? 'default' : 'outline'}
                              onClick={() => handleFilterChange('type', option)}
                              className="justify-start"
                            >
                              {option}
                            </Button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Price Range */}
                    <AccordionItem value="price">
                      <AccordionTrigger>Price Range</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <Slider
                            value={filters.priceRange}
                            onValueChange={(value) => handleFilterChange('priceRange', value)}
                            min={0}
                            max={10000}
                            step={100}
                          />
                          <div className="flex justify-between text-sm">
                            <span>€{filters.priceRange[0]}</span>
                            <span>€{filters.priceRange[1]}</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Amenities */}
                    <AccordionItem value="amenities">
                      <AccordionTrigger>Amenities</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-2">
                          {amenities.map((amenity) => (
                            <div key={amenity} className="flex items-center space-x-2">
                              <Checkbox
                                id={amenity}
                                checked={filters.amenities.includes(amenity)}
                                onCheckedChange={(checked) => {
                                  const newAmenities = checked
                                    ? [...filters.amenities, amenity]
                                    : filters.amenities.filter((a) => a !== amenity);
                                  handleFilterChange('amenities', newAmenities);
                                }}
                              />
                              <label htmlFor={amenity} className="text-sm">
                                {amenity}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Features */}
                    <AccordionItem value="features">
                      <AccordionTrigger>Features</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-2">
                          {features.map((feature) => (
                            <div key={feature} className="flex items-center space-x-2">
                              <Checkbox
                                id={feature}
                                checked={filters.features.includes(feature)}
                                onCheckedChange={(checked) => {
                                  const newFeatures = checked
                                    ? [...filters.features, feature]
                                    : filters.features.filter((f) => f !== feature);
                                  handleFilterChange('features', newFeatures);
                                }}
                              />
                              <label htmlFor={feature} className="text-sm">
                                {feature}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Additional Options */}
                    <AccordionItem value="options">
                      <AccordionTrigger>Additional Options</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-sm">Verified Only</label>
                            <Switch
                              checked={filters.verifiedOnly}
                              onCheckedChange={(checked) =>
                                handleFilterChange('verifiedOnly', checked)
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm">Instant Book</label>
                            <Switch
                              checked={filters.instantBook}
                              onCheckedChange={(checked) =>
                                handleFilterChange('instantBook', checked)
                              }
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                <SheetFooter>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button onClick={() => setIsFiltersOpen(false)}>
                    Show Results
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {filter}
              <X className="h-3 w-3 cursor-pointer" />
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
    </div>
  );
}