'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check,
  X,
  Edit2,
  MapPin,
  Euro,
  Bed,
  Bath,
  Square,
  Building2,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useListingCreation } from '@/contexts/listing-creation-context';
import { useToast } from '@/components/ui/use-toast';
import { cn, formatPrice } from '@/lib/utils';

export function ListingReview() {
  const router = useRouter();
  const { toast } = useToast();
  const { state } = useListingCreation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data } = state;
  const property = data.property!;

  const sections = [
    {
      title: 'Basic Information',
      items: [
        { label: 'Title', value: data.title },
        { label: 'Description', value: data.description },
        { label: 'Location', value: data.location, icon: MapPin },
      ],
    },
    {
      title: 'Property Details',
      items: [
        { 
          label: 'Type', 
          value: property.type.charAt(0).toUpperCase() + property.type.slice(1),
          icon: Building2,
        },
        { 
          label: 'Status', 
          value: property.status === 'FOR_SALE' ? 'For Sale' : 'For Rent',
          badge: true,
        },
        { label: 'Bedrooms', value: property.bedrooms, icon: Bed },
        { label: 'Bathrooms', value: property.bathrooms, icon: Bath },
        { label: 'Size', value: `${property.size} m²`, icon: Square },
      ],
    },
    {
      title: 'Features',
      items: property.features.map(feature => ({
        label: feature.charAt(0).toUpperCase() + feature.slice(1),
        value: true,
      })),
    },
    {
      title: 'Pricing',
      items: [
        { 
          label: 'Price', 
          value: formatPrice(property.price),
          icon: Euro,
        },
        { 
          label: 'Price per m²', 
          value: formatPrice(Math.round(property.price / property.size)) + '/m²',
        },
      ],
    },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Here you would submit the listing data to your API
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create listing');

      toast({
        title: 'Success!',
        description: 'Your listing has been created successfully.',
      });

      // Redirect to the new listing
      const result = await response.json();
      router.push(`/properties/${result.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create listing. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          Review Your Listing
        </h2>
        <p className="text-muted-foreground">
          Make sure everything looks good before publishing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Images */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-semibold">Images</h3>
              <Button variant="ghost" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={data.images[currentImageIndex]}
                      alt={`Image ${currentImageIndex + 1}`}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-5 gap-2 mt-4">
                {data.images.map((image, index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative aspect-square rounded-md overflow-hidden cursor-pointer",
                      index === currentImageIndex && "ring-2 ring-primary"
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {formatPrice(property.price)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatPrice(Math.round(property.price / property.size))}/m²
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={section.title}>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="font-semibold">{section.title}</h3>
                <Button variant="ghost" size="sm">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      {itemIndex > 0 && section.title !== 'Features' && (
                        <Separator className="my-4" />
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.icon && (
                            <item.icon className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-muted-foreground">
                            {item.label}
                          </span>
                        </div>
                        {item.badge ? (
                          <Badge variant={item.value === 'For Sale' ? 'default' : 'secondary'}>
                            {item.value}
                          </Badge>
                        ) : item.value === true ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <span className="font-medium">{item.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" disabled={isSubmitting}>
          Save as Draft
        </Button>
        <div className="space-x-4">
          <Button
            variant="destructive"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-500 hover:bg-green-600"
          >
            {isSubmitting ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Publish Listing
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <p className="text-sm text-muted-foreground text-center mt-8">
        By publishing, you agree to our{' '}
        <a href="/terms" className="text-primary hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/guidelines" className="text-primary hover:underline">
          Listing Guidelines
        </a>
      </p>
    </div>
  );
}