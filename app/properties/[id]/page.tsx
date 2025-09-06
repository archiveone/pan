import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PropertyService } from '@/lib/services/propertyService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  MapPinIcon,
  BedDoubleIcon,
  BathIcon,
  RulerIcon,
  CalendarIcon,
  BanknotesIcon,
  ClipboardIcon,
  StarIcon,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';

interface PropertyPageProps {
  params: {
    id: string;
  };
}

async function getProperty(id: string) {
  const propertyService = new PropertyService();
  const property = await propertyService.getProperty(id);
  if (!property) notFound();
  return property;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const property = await getProperty(params.id);
  const {
    title,
    description,
    price,
    currency,
    type,
    listingType,
    status,
    address,
    images,
    bedrooms,
    bathrooms,
    size,
    features,
    virtualTour,
    floorPlan,
    energyRating,
    owner,
    agent,
    isVerified,
    reviews,
    _count,
  } = property;

  const formattedPrice = formatCurrency(price, currency);
  const location = `${address.street}, ${address.city}, ${address.country}`;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="mt-2 flex items-center gap-2 text-muted-foreground">
              <MapPinIcon className="h-4 w-4" />
              {location}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formattedPrice}</div>
            {listingType === 'RENT' && (
              <div className="text-sm text-muted-foreground">per month</div>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Badge variant={listingType === 'RENT' ? 'secondary' : 'default'}>
            {listingType === 'RENT' ? 'For Rent' : 'For Sale'}
          </Badge>
          <Badge variant="outline">{type}</Badge>
          <Badge variant="outline">{status}</Badge>
          {isVerified && (
            <Badge variant="secondary" className="bg-green-500 text-white">
              Verified
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-8 grid gap-4">
            {images.length > 0 ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                <Image
                  src={images[0].url}
                  alt={images[0].caption || title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-muted">
                No images available
              </div>
            )}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.slice(1, 5).map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-lg"
                  >
                    <Image
                      src={image.url}
                      alt={image.caption || `${title} - Image ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Property Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {bedrooms && (
                  <div className="flex items-center gap-2">
                    <BedDoubleIcon className="h-5 w-5 text-muted-foreground" />
                    <span>{bedrooms} Bedrooms</span>
                  </div>
                )}
                {bathrooms && (
                  <div className="flex items-center gap-2">
                    <BathIcon className="h-5 w-5 text-muted-foreground" />
                    <span>{bathrooms} Bathrooms</span>
                  </div>
                )}
                {size && (
                  <div className="flex items-center gap-2">
                    <RulerIcon className="h-5 w-5 text-muted-foreground" />
                    <span>{size} m²</span>
                  </div>
                )}
                {energyRating && (
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-muted-foreground" />
                    <span>Energy Rating: {energyRating}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{description}</p>
            </CardContent>
          </Card>

          {/* Features */}
          {features.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center gap-2"
                    >
                      {feature.icon && (
                        <span className="text-muted-foreground">
                          {feature.icon}
                        </span>
                      )}
                      <span>{feature.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Virtual Tour & Floor Plan */}
          {(virtualTour || floorPlan) && (
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              {virtualTour && (
                <Card>
                  <CardHeader>
                    <CardTitle>Virtual Tour</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(virtualTour, '_blank')}
                    >
                      View Virtual Tour
                    </Button>
                  </CardContent>
                </Card>
              )}
              {floorPlan && (
                <Card>
                  <CardHeader>
                    <CardTitle>Floor Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(floorPlan, '_blank')}
                    >
                      View Floor Plan
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Contact Card */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>
                Get in touch about this property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {agent ? (
                <div className="flex items-center gap-4">
                  {agent.image && (
                    <Image
                      src={agent.image}
                      alt={agent.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-semibold">{agent.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Property Agent
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {owner.image && (
                    <Image
                      src={owner.image}
                      alt={owner.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-semibold">{owner.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Property Owner
                    </div>
                  </div>
                </div>
              )}
              <div className="grid gap-2">
                <Button>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Schedule Viewing
                </Button>
                <Button variant="outline">
                  <BanknotesIcon className="mr-2 h-4 w-4" />
                  Make an Offer
                </Button>
                {agent && (
                  <Button variant="outline">
                    <ClipboardIcon className="mr-2 h-4 w-4" />
                    Request Valuation
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          {_count && (
            <Card>
              <CardHeader>
                <CardTitle>Property Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {_count.favorites}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Favorites
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {_count.viewings}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Viewings
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {_count.offers}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Offers
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {_count.reviews}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Reviews
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}

export const dynamic = 'force-dynamic';