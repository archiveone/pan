'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PropertyListingForm } from '@/components/properties/PropertyListingForm'
import { useCreateProperty } from '@/hooks/use-properties'
import { Button } from '@/components/ui/button'

export default function NewPropertyPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { createProperty, isCreating } = useCreateProperty()

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin?callbackUrl=/properties/new')
    return null
  }

  const handleSubmit = async (data: any) => {
    try {
      const property = await createProperty(data)
      router.push(\`/properties/\${property.id}\`)
    } catch (error) {
      console.error('Failed to create property:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Create New Property Listing</h1>
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isCreating}
        >
          Cancel
        </Button>
      </div>

      <div className="max-w-3xl mx-auto">
        <PropertyListingForm
          onSubmit={handleSubmit}
          isLoading={isCreating}
        />
      </div>
    </div>
  )
}