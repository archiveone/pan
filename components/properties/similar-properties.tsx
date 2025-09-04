'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bed, Bath, Square, MapPin, Euro } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatNumber } from '@/lib/utils';

interface SimilarPropertiesProps {
  properties: any[]; // Replace with proper type
}

export function SimilarProperties({ properties }: SimilarPropertiesProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (properties.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Similar Properties</h2>
          <p className="text-muted-foreground">
            Properties you might also be interested in
          </p>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {properties.map((property) => (
          <motion.div key={property.id} variants={itemVariants}>
            <Link href={`/properties/${property.id}`}>
              <Card className="group overflow-hidden h-full hover:shadow-lg transition-shadow duration-300">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={property.propertyListing.images[0]}
                    alt={property.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Price Tag */}
                  <div className="absolute top-4 right-4">
                    <Badge 
                      variant="secondary" 
                      className="text-lg font-semibold px-3 py-1.5 shadow-md bg-white"
                    >
                      <Euro className="w-4 h-4 inline-block mr-1" />
                      {formatPrice(property.propertyListing.price, false)}
                    </Badge>
                  </div>

                  {/* Property Status */}
                  <div className="absolute top-4 left-4">
                    <Badge 
                      className={property.propertyListing.status === 'FOR_SALE' ? 'bg-green-600' : 'bg-blue-600'}
                    >
                      {property.propertyListing.status === 'FOR_SALE' ? 'For Sale' : 'For Rent'}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>

                  <div className="flex items-center text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{property.propertyListing.location}</span>
                  </div>

                  {/* Property Details */}
                  <div className="grid grid-cols-3 gap-4 py-3 border-t">
                    <div className="flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {property.propertyListing.bedrooms} {property.propertyListing.bedrooms === 1 ? 'Bed' : 'Beds'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bath className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {property.propertyListing.bathrooms} {property.propertyListing.bathrooms === 1 ? 'Bath' : 'Baths'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Square className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{formatNumber(property.propertyListing.size)}m²</span>
                    </div>
                  </div>

                  {/* Property Features */}
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {property.propertyListing.features?.slice(0, 3).map((feature: string) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}