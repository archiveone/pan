"use client";

import { useState, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropertyType, ListingType } from '@prisma/client';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal } from 'lucide-react';

interface PropertyFiltersProps {
  className?: string;
}

export function PropertyFilters({ className }: PropertyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Get initial values from URL
  const [filters, setFilters] = useState({
    type: (searchParams.get('type') as PropertyType) || undefined,
    listingType: (searchParams.get('listingType') as ListingType) || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    minBedrooms: searchParams.get('minBedrooms') ? Number(searchParams.get('minBedrooms')) : undefined,
    maxBedrooms: searchParams.get('maxBedrooms') ? Number(searchParams.get('maxBedrooms')) : undefined,
    minBathrooms: searchParams.get('minBathrooms') ? Number(searchParams.get('minBathrooms')) : undefined,
    maxBathrooms: searchParams.get('maxBathrooms') ? Number(searchParams.get('maxBathrooms')) : undefined,
  });

  const applyFilters = useCallback(() => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);

      // Update or remove params based on filter values
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      router.push(`?${params.toString()}`);
    });
  }, [filters, router, searchParams]);

  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        <Select
          value={filters.listingType}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, listingType: value as ListingType }))
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Listing Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SALE">For Sale</SelectItem>
            <SelectItem value="RENT">For Rent</SelectItem>
            <SelectItem value="AUCTION">Auction</SelectItem>
            <SelectItem value="PRIVATE_SALE">Private Sale</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.type}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, type: value as PropertyType }))
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="RESIDENTIAL">Residential</SelectItem>
            <SelectItem value="COMMERCIAL">Commercial</SelectItem>
            <SelectItem value="LUXURY">Luxury</SelectItem>
            <SelectItem value="TIMESHARE">Timeshare</SelectItem>
            <SelectItem value="LAND">Land</SelectItem>
            <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
          </SelectContent>
        </Select>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-6">
              <div className="space-y-2">
                <Label>Price Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minPrice: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxPrice: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minBedrooms || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minBedrooms: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxBedrooms || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxBedrooms: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bathrooms</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minBathrooms || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minBathrooms: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxBathrooms || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxBathrooms: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={applyFilters}
                disabled={isPending}
              >
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}