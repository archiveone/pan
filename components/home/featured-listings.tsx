'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bed, Bath, Square, MapPin, Euro } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatNumber } from '@/lib/utils';

interface FeaturedListingsProps {
  listings: any[]; // Replace with proper type
}

export function FeaturedListings({ listings }: FeaturedListingsProps) {
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

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Properties</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our handpicked selection of premium properties across Ireland
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {listings.map((listing) => (
            <motion.div key={listing.id} variants={itemVariants}>
              <Link href={`/properties/${listing.id}`}>
                <Card className="group overflow-hidden h-full hover:shadow-lg transition-shadow duration-300">
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={listing.propertyListing.images[0]}
                      alt={listing.title}
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
                        {formatPrice(listing.propertyListing.price, false)}
                      </Badge>
                    </div>

                    {/* Property Status */}
                    <div className="absolute top-4 left-4">
                      <Badge 
                        className={listing.propertyListing.status === 'FOR_SALE' ? 'bg-green-600' : 'bg-blue-600'}
                      >
                        {listing.propertyListing.status === 'FOR_SALE' ? 'For Sale' : 'For Rent'}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>

                    <div className="flex items-center text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{listing.propertyListing.location}</span>
                    </div>

                    {/* Property Details */}
                    <div className="grid grid-cols-3 gap-4 py-3 border-y">
                      <div className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {listing.propertyListing.bedrooms} {listing.propertyListing.bedrooms === 1 ? 'Bed' : 'Beds'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {listing.propertyListing.bathrooms} {listing.propertyListing.bathrooms === 1 ? 'Bath' : 'Baths'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Square className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{formatNumber(listing.propertyListing.size)}m²</span>
                      </div>
                    </div>

                    {/* Property Features */}
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {listing.propertyListing.features?.slice(0, 3).map((feature: string) => (
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
      </div>
    </section>
  );
}