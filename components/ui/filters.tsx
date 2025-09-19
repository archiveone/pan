'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Filter as FilterIcon } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'

interface FilterOption {
  id: string
  name: string
  icon?: React.ElementType
}

interface FilterGroup {
  id: string
  name: string
  type: 'button' | 'select' | 'range' | 'switch' | 'checkbox'
  options?: FilterOption[]
  range?: {
    min: number
    max: number
    step: number
    format?: (value: number) => string
  }
}

interface FiltersProps {
  groups: FilterGroup[]
  selectedFilters: Record<string, any>
  onFilterChange: (groupId: string, value: any) => void
  className?: string
}

export function Filters({
  groups,
  selectedFilters,
  onFilterChange,
  className
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn('flex flex-col md:flex-row justify-between items-start md:items-center', className)}>
      {/* Desktop Filters */}
      <div className="hidden md:flex flex-1 w-full md:w-auto mb-4 md:mb-0">
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => {
            if (group.type === 'button' && group.options) {
              return group.options.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.id}
                    onClick={() => onFilterChange(group.id, option.id)}
                    className={cn(
                      'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors',
                      selectedFilters[group.id] === option.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-foreground hover:bg-muted'
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4 mr-2" />}
                    {option.name}
                  </button>
                )
              })
            }
            return null
          })}
        </div>
      </div>

      {/* Desktop Select Filters */}
      <div className="hidden md:flex items-center space-x-4">
        {groups.map((group) => {
          if (group.type === 'select' && group.options) {
            return (
              <Select
                key={group.id}
                value={selectedFilters[group.id]}
                onValueChange={(value) => onFilterChange(group.id, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={group.name} />
                </SelectTrigger>
                <SelectContent>
                  {group.options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }
          return null
        })}

        {/* More Filters Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="greia-button-secondary">
              <FilterIcon className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:max-w-none">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Refine your search with additional filters
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6">
              {groups.map((group) => (
                <div key={group.id} className="space-y-4">
                  <h3 className="font-medium">{group.name}</h3>
                  {group.type === 'range' && group.range && (
                    <div className="space-y-4">
                      <Slider
                        value={[selectedFilters[group.id] || group.range.min]}
                        min={group.range.min}
                        max={group.range.max}
                        step={group.range.step}
                        onValueChange={([value]) => onFilterChange(group.id, value)}
                      />
                      <div className="text-sm text-muted-foreground">
                        {group.range.format
                          ? group.range.format(selectedFilters[group.id] || group.range.min)
                          : selectedFilters[group.id] || group.range.min}
                      </div>
                    </div>
                  )}
                  {group.type === 'switch' && (
                    <Switch
                      checked={selectedFilters[group.id] || false}
                      onCheckedChange={(checked) => onFilterChange(group.id, checked)}
                    />
                  )}
                  {group.type === 'checkbox' && group.options && (
                    <div className="space-y-2">
                      {group.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={option.id}
                            checked={selectedFilters[group.id]?.includes(option.id)}
                            onCheckedChange={(checked) => {
                              const current = selectedFilters[group.id] || []
                              onFilterChange(
                                group.id,
                                checked
                                  ? [...current, option.id]
                                  : current.filter((id: string) => id !== option.id)
                              )
                            }}
                          />
                          <label
                            htmlFor={option.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {option.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  Object.keys(selectedFilters).forEach((key) => {
                    onFilterChange(key, null)
                  })
                  setIsOpen(false)
                }}
              >
                Reset
              </Button>
              <Button onClick={() => setIsOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden w-full">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <FilterIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="py-6 space-y-6">
              {groups.map((group) => (
                <div key={group.id} className="space-y-4">
                  <h3 className="font-medium">{group.name}</h3>
                  {group.type === 'button' && group.options && (
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((option) => {
                        const Icon = option.icon
                        return (
                          <button
                            key={option.id}
                            onClick={() => onFilterChange(group.id, option.id)}
                            className={cn(
                              'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors',
                              selectedFilters[group.id] === option.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background text-foreground hover:bg-muted'
                            )}
                          >
                            {Icon && <Icon className="h-4 w-4 mr-2" />}
                            {option.name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {group.type === 'select' && group.options && (
                    <Select
                      value={selectedFilters[group.id]}
                      onValueChange={(value) => onFilterChange(group.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={group.name} />
                      </SelectTrigger>
                      <SelectContent>
                        {group.options.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {/* Other filter types remain the same as desktop */}
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

// Loading State
export function FiltersSkeleton() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div className="flex-1 w-full md:w-auto mb-4 md:mb-0">
        <div className="flex flex-wrap gap-2">
          {Array(4).fill(null).map((_, i) => (
            <div
              key={i}
              className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
      </div>
    </div>
  )
}