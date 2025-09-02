import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PropertyCardProps {
  id: string
  title: string
  price: number
  currency?: string
  location: string
  bedrooms?: number
  bathrooms?: number
  propertyType: string
  listingType: 'sale' | 'rent'
  imageUrl: string
}

export function PropertyCard({
  id,
  title,
  price,
  currency = 'GBP',
  location,
  bedrooms,
  bathrooms,
  propertyType,
  listingType,
  imageUrl,
}: PropertyCardProps) {
  return (
    <Link href={`/properties/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          <div className="relative w-full h-48">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <Badge 
              className="absolute top-2 right-2"
              variant={listingType === 'sale' ? 'default' : 'secondary'}
            >
              {listingType === 'sale' ? 'For Sale' : 'For Rent'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-xl font-bold text-primary">
            {currency === 'GBP' ? '£' : currency} 
            {price.toLocaleString()}
            {listingType === 'rent' && '/month'}
          </p>
          <p className="text-muted-foreground">{location}</p>
        </CardContent>
        <CardFooter className="px-4 py-3 border-t flex justify-between">
          <div className="flex items-center gap-4">
            {bedrooms && (
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground">{bedrooms} bed</span>
              </span>
            )}
            {bathrooms && (
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground">{bathrooms} bath</span>
              </span>
            )}
          </div>
          <Badge variant="outline">{propertyType}</Badge>
        </CardFooter>
      </Card>
    </Link>
  )
}