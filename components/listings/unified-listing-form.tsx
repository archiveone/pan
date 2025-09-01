'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Upload, X, MapPin, Euro, Tag, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

const IRISH_COUNTIES = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal',
  'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny',
  'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath',
  'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone',
  'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
]

const LISTING_TYPES = {
  PROPERTY: [
    { value: 'RESIDENTIAL_SALE', label: 'Residential Sale' },
    { value: 'RESIDENTIAL_RENT', label: 'Residential Rent' },
    { value: 'COMMERCIAL_SALE', label: 'Commercial Sale' },
    { value: 'COMMERCIAL_RENT', label: 'Commercial Rent' },
    { value: 'APARTMENT_SALE', label: 'Apartment Sale' },
    { value: 'APARTMENT_RENT', label: 'Apartment Rent' },
    { value: 'STUDIO_SALE', label: 'Studio Sale' },
    { value: 'STUDIO_RENT', label: 'Studio Rent' },
    { value: 'TIMESHARE', label: 'Timeshare' },
    { value: 'LUXURY_SALE', label: 'Luxury Sale' },
    { value: 'LUXURY_RENT', label: 'Luxury Rent' },
    { value: 'SHORT_TERM_RENTAL', label: 'Short-term Rental' }
  ],
  SERVICE: [
    { value: 'CONTRACTOR', label: 'Contractor' },
    { value: 'PROFESSIONAL_SERVICE', label: 'Professional Service' },
    { value: 'FREELANCER', label: 'Freelancer' },
    { value: 'CONSULTANT', label: 'Consultant' }
  ],
  LEISURE: [
    { value: 'EVENT', label: 'Event' },
    { value: 'TOUR', label: 'Tour' },
    { value: 'EXPERIENCE', label: 'Experience' },
    { value: 'ENTERTAINMENT', label: 'Entertainment' },
    { value: 'DINING', label: 'Dining' }
  ]
}

export default function UnifiedListingForm() {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    price: '',
    location: '',
    county: '',
    images: [] as string[],
    features: {},
    contactInfo: {}
  })
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    const uploadedImages = []

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('purpose', 'listing')

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const result = await response.json()
          uploadedImages.push(result.url)
        }
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('Failed to upload image')
      }
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedImages]
    }))
    setUploading(false)
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      toast.error('Please sign in to create a listing')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        if (result.agentRequestId) {
          toast.success(result.message)
        } else {
          toast.success('Listing created successfully!')
        }
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: '',
          type: '',
          price: '',
          location: '',
          county: '',
          images: [],
          features: {},
          contactInfo: {}
        })
      } else {
        toast.error(result.error || 'Failed to create listing')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to create listing')
    } finally {
      setSubmitting(false)
    }
  }

  const availableTypes = formData.category ? LISTING_TYPES[formData.category as keyof typeof LISTING_TYPES] || [] : []

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Create New Listing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter listing title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value, type: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROPERTY">Property</SelectItem>
                  <SelectItem value="SERVICE">Service</SelectItem>
                  <SelectItem value="LEISURE">Leisure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                disabled={!formData.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (EUR)</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter address or area"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="county">County *</Label>
              <Select
                value={formData.county}
                onValueChange={(value) => setFormData(prev => ({ ...prev, county: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {IRISH_COUNTIES.map((county) => (
                    <SelectItem key={county} value={county}>
                      {county}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your listing in detail..."
              rows={4}
              required
            />
          </div>

          {/* Images */}
          <div className="space-y-4">
            <Label>Images</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="images" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload images
                    </span>
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting || uploading}
              className="min-w-32"
            >
              {submitting ? 'Creating...' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
