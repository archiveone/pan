import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { toast } from 'sonner'

// Types
export interface Property {
  id: string
  title: string
  description: string
  price: number
  currency: string
  location: string
  propertyType: 'HOUSE' | 'APARTMENT' | 'COMMERCIAL' | 'LAND'
  listingType: 'SALE' | 'RENT'
  status: 'ACTIVE' | 'UNDER_OFFER' | 'SOLD' | 'RENTED' | 'INACTIVE'
  bedrooms?: number
  bathrooms?: number
  features: string[]
  amenities: string[]
  images: {
    id: string
    url: string
    isPrimary: boolean
  }[]
  user: {
    id: string
    name: string
    image?: string
    agentProfile?: {
      id: string
      company?: string
      licenseNumber?: string
      phone?: string
    }
  }
  _count?: {
    views: number
    favorites: number
    enquiries: number
  }
  createdAt: string
  updatedAt: string
}

export interface PropertyFilters {
  page?: number
  limit?: number
  propertyType?: string
  listingType?: string
  minPrice?: number
  maxPrice?: number
  location?: string
  search?: string
}

// API fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Failed to fetch data')
  }
  return res.json()
}

// Mutation functions
async function createProperty(url: string, { arg }: { arg: Partial<Property> }) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  })
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Failed to create property')
  }
  
  return res.json()
}

async function updateProperty(url: string, { arg }: { arg: Partial<Property> }) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  })
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Failed to update property')
  }
  
  return res.json()
}

async function deleteProperty(url: string) {
  const res = await fetch(url, { method: 'DELETE' })
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Failed to delete property')
  }
  
  return res.json()
}

// Hook for fetching properties list with filters
export function useProperties(filters: PropertyFilters = {}) {
  const queryString = new URLSearchParams(
    Object.entries(filters).filter(([_, value]) => value !== undefined) as string[][]
  ).toString()
  
  const { data, error, isLoading, mutate } = useSWR<{
    properties: Property[]
    pagination: {
      total: number
      pages: number
      page: number
      limit: number
    }
  }>(\`/api/properties?\${queryString}\`, fetcher)

  return {
    properties: data?.properties || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  }
}

// Hook for fetching single property
export function useProperty(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Property>(
    id ? \`/api/properties/\${id}\` : null,
    fetcher
  )

  return {
    property: data,
    isLoading,
    error,
    mutate,
  }
}

// Hook for creating property
export function useCreateProperty() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/properties',
    createProperty,
    {
      onSuccess: () => {
        toast.success('Property listing created successfully')
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to create property listing')
      },
    }
  )

  return {
    createProperty: trigger,
    isCreating: isMutating,
    error,
  }
}

// Hook for updating property
export function useUpdateProperty(id: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    \`/api/properties/\${id}\`,
    updateProperty,
    {
      onSuccess: () => {
        toast.success('Property listing updated successfully')
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to update property listing')
      },
    }
  )

  return {
    updateProperty: trigger,
    isUpdating: isMutating,
    error,
  }
}

// Hook for deleting property
export function useDeleteProperty(id: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    \`/api/properties/\${id}\`,
    deleteProperty,
    {
      onSuccess: () => {
        toast.success('Property listing deleted successfully')
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to delete property listing')
      },
    }
  )

  return {
    deleteProperty: trigger,
    isDeleting: isMutating,
    error,
  }
}