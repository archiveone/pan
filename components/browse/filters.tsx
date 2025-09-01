'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { X, Filter, MapPin, Euro, Calendar, Users } from 'lucide-react'

const IRISH_COUNTIES = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal',
  'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny',
  'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath',
  'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone',
  'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
]

interface FiltersProps {
  onFiltersChange: (filters: any) => void
}

export default function Filters({ onFiltersChange }: FiltersProps) {
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    county: '',
    priceRange: [0, 1000000],
    bedrooms: '',
    bathrooms: '',
    propertyType: [],
    serviceType: [],
    experienceType: [],
    dateRange: '',
    rating: '',
    verified: false
  })

  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)

    // Update active filters for display
    if (value && value !== '' && value !== 0) {
      if (!activeFilters.includes(key)) {
        setActiveFilters([...activeFilters, key])
      }
    } else {
      setActiveFilters(activeFilters.filter(f => f !== key))
    }
  }

  const clearFilter = (key: string) => {
    updateFilter(key, key === 'priceRange' ? [0, 1000000] : '')
  }

  const clearAllFilters = () => {
    const resetFilters = {
      category: '',
      type: '',
      county: '',
      priceRange: [0, 1000000],
      bedrooms: '',
      bathrooms: '',
      propertyType: [],
      serviceType: [],
      experienceType: [],
      dateRange: '',
      rating: '',
      verified: false
    }
    setFilters(resetFilters)
    setActiveFilters([])
    onFiltersChange(resetFilters)
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `€${(price / 1000000).toFixed(1)}M`
    if (price >= 1000) return `€${(price / 1000).toFixed(0)}K`
    return `€${price.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Active Filters</h4>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filterKey) => (
                <Badge key={filterKey} variant="secondary" className="flex items-center gap-1">
                  {filterKey === 'priceRange' 
                    ? `${formatPrice(filters.priceRange[0])} - ${formatPrice(filters.priceRange[1])}`
                    : filters[filterKey as keyof typeof filters]?.toString() || filterKey
                  }
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => clearFilter(filterKey)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="PROPERTY">Properties</SelectItem>
                <SelectItem value="SERVICE">Services</SelectItem>
                <SelectItem value="LEISURE">Experiences</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              County
            </Label>
            <Select value={filters.county} onValueChange={(value) => updateFilter('county', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All counties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counties</SelectItem>
                {IRISH_COUNTIES.map((county) => (
                  <SelectItem key={county} value={county}>
                    {county}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Price Range
            </Label>
            <div className="px-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilter('priceRange', value)}
                max={1000000}
                min={0}
                step={10000}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatPrice(filters.priceRange[0])}</span>
              <span>{formatPrice(filters.priceRange[1])}</span>
            </div>
          </div>

          {/* Property-specific filters */}
          {filters.category === 'PROPERTY' && (
            <>
              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <Select value={filters.bedrooms} onValueChange={(value) => updateFilter('bedrooms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Bathrooms</Label>
                <Select value={filters.bathrooms} onValueChange={(value) => updateFilter('bathrooms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Service-specific filters */}
          {filters.category === 'SERVICE' && (
            <div className="space-y-2">
              <Label>Minimum Rating</Label>
              <Select value={filters.rating} onValueChange={(value) => updateFilter('rating', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Rating</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.8">4.8+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Experience-specific filters */}
          {filters.category === 'LEISURE' && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </Label>
              <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="next-month">Next Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Verified Only */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={filters.verified}
              onCheckedChange={(checked) => updateFilter('verified', checked)}
            />
            <Label htmlFor="verified" className="text-sm">
              Verified listings only
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={() => {
                updateFilter('category', 'PROPERTY')
                updateFilter('county', 'Dublin')
              }}
            >
              Dublin Properties
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={() => {
                updateFilter('category', 'SERVICE')
                updateFilter('type', 'CONTRACTOR')
              }}
            >
              Home Contractors
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={() => {
                updateFilter('category', 'LEISURE')
                updateFilter('county', 'Cork')
              }}
            >
              Cork Experiences
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={() => {
                updateFilter('category', 'PROPERTY')
                updateFilter('priceRange', [0, 500000])
              }}
            >
              Under €500K
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
