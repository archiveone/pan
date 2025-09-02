'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PropertyListingForm } from '@/components/properties/PropertyListingForm'
import { useProperty, useUpdateProperty, useDeleteProperty } from '@/hooks/use-properties'
import { Loader2, MapPin, Phone, Mail, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  
  const { property, isLoading, mutate } = useProperty(params.id)
  const { updateProperty, isUpdating } = useUpdateProperty(params.id)
  const { deleteProperty, isDeleting } = useDeleteProperty(params.id)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/properties')}>
            Back to Properties
          </Button>
        </div>
      </div>
    )
  }

  const isOwner = session?.user?.id === property.user.id
  const canEdit = isOwner || session?.user?.role === 'ADMIN'

  const handleUpdate = async (data: any) => {
    try {
      await updateProperty(data)
      setIsEditing(false)
      mutate() // Refresh property data
      toast.success('Property updated successfully')
    } catch (error) {
      console.error('Failed to update property:', error)
      toast.error('Failed to update property')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property?')) return

    try {
      await deleteProperty()
      toast.success('Property deleted successfully')
      router.push('/properties')
    } catch (error) {
      console.error('Failed to delete property:', error)
      toast.error('Failed to delete property')
    }
  }

  if (isEditing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Edit Property Listing</h1>
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
        </div>

        <div className="max-w-3xl mx-auto">
          <PropertyListingForm
            initialData={property}
            onSubmit={handleUpdate}
            isLoading={isUpdating}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Property Images */}
          <div className="relative w-full h-[400px] mb-6 rounded-lg overflow-hidden">
            {property.images?.[0] ? (
              <Image
                src={property.images[0].url}
                alt={property.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No image available</p>
              </div>
            )}
            <Badge 
              className="absolute top-4 right-4"
              variant={property.listingType === 'SALE' ? 'default' : 'secondary'}
            >
              {property.listingType === 'SALE' ? 'For Sale' : 'For Rent'}
            </Badge>
          </div>

          {/* Property Details Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
              <TabsTrigger value="location" className="flex-1">Location</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">{property.title}</h1>
                {canEdit && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      disabled={isDeleting}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-2xl font-bold text-primary mb-4">
                {property.currency === 'GBP' ? '£' : property.currency} 
                {property.price.toLocaleString()}
                {property.listingType === 'RENT' && '/month'}
              </p>

              <div className="flex items-center text-muted-foreground mb-6">
                <MapPin className="h-4 w-4 mr-2" />
                <p>{property.location}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="font-semibold">{property.bedrooms || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="font-semibold">{property.bathrooms || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="font-semibold">{property.propertyType}</p>
                  <p className="text-sm text-muted-foreground">Property Type</p>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{property.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Property Features</h2>
              {property.features?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center p-3 bg-muted rounded-lg">
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No features listed</p>
              )}

              <h2 className="text-2xl font-semibold mt-8 mb-4">Nearby Amenities</h2>
              {property.amenities?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center p-3 bg-muted rounded-lg">
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No amenities listed</p>
              )}
            </TabsContent>

            <TabsContent value="location" className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Location</h2>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Map integration coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  {property.user.image ? (
                    <Image
                      src={property.user.image}
                      alt={property.user.name || 'Agent'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      {property.user.name?.[0] || 'A'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{property.user.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {property.user.agentProfile ? 'Property Agent' : 'Property Owner'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {property.user.agentProfile?.phone && (
                  <Button className="w-full" onClick={() => window.location.href = `tel:${property.user.agentProfile.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Agent
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = `mailto:${property.user.email}`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Agent
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground text-center w-full">
                Reference: {property.id}
              </p>
            </CardFooter>
          </Card>

          {/* Property Stats */}
          {property._count && (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{property._count.views}</p>
                    <p className="text-sm text-muted-foreground">Views</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{property._count.favorites}</p>
                    <p className="text-sm text-muted-foreground">Favorites</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{property._count.enquiries}</p>
                    <p className="text-sm text-muted-foreground">Enquiries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Actions */}
          <div className="mt-6 space-y-4">
            <Button variant="outline" className="w-full">Save Property</Button>
            <Button variant="outline" className="w-full">Share Property</Button>
            <Button variant="outline" className="w-full">Report Listing</Button>
          </div>
        </div>
      </div>
    </div>
  )
}