'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, Heart, MapPin, Bed, Bath, Square, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatNumber } from '@/lib/utils';

interface FeaturedPropertiesProps {
  properties: any[]; // Replace with proper type
}

export function FeaturedProperties({ properties }: FeaturedPropertiesProps) {
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
    <section className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-3xl font-bold mb-2">Featured Properties</h2>
          <p className="text-muted-foreground">
            Discover our handpicked selection of premium properties
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/properties" className="flex items-center gap-2">
            View All Properties
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {properties.map((property) => (
          <motion.div key={property.id} variants={itemVariants}>
            <Card className="group overflow-hidden">
              <Link href={`/properties/${property.id}`}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={property.propertyListing.images[0]}
                    alt={property.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Price Tag */}
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="text-lg font-semibold px-3 py-1">
                      {formatPrice(property.propertyListing.price)}
                      {property.propertyListing.type === 'RENT' && '/month'}
                    </Badge>
                  </div>
                  
                  {/* Stats */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.propertyListing.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.propertyListing.bathrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="w-4 h-4" />
                        <span>{property.propertyListing.size}m²</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{formatNumber(property._count.views)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{formatNumber(property._count.favorites)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <CardContent className="p-4">
                <Link href={`/properties/${property.id}`}>
                  <h3 className="text-xl font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                </Link>
                
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{property.propertyListing.location}</span>
                </div>
                
                <p className="text-muted-foreground line-clamp-2">
                  {property.description}
                </p>
              </CardContent>

              <CardFooter className="p-4 pt-0 flex items-center justify-between">
                <Link href={`/profile/${property.user.id}`} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={property.user.image} alt={property.user.name} />
                    <AvatarFallback>
                      {property.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{property.user.name}</span>
                </Link>
                
                <Badge variant={property.propertyListing.type === 'RENT' ? 'secondary' : 'default'}>
                  {property.propertyListing.type === 'RENT' ? 'For Rent' : 'For Sale'}
                </Badge>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}