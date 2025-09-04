'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, ArrowRight, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatNumber } from '@/lib/utils';

interface TrendingExperiencesProps {
  experiences: any[]; // Replace with proper type
}

export function TrendingExperiences({ experiences }: TrendingExperiencesProps) {
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
          <h2 className="text-3xl font-bold mb-2">Trending Experiences</h2>
          <p className="text-muted-foreground">
            Discover unique activities, rentals, and memorable experiences
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/leisure" className="flex items-center gap-2">
            View All Experiences
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {experiences.map((experience) => (
          <motion.div key={experience.id} variants={itemVariants}>
            <Card className="group overflow-hidden h-full flex flex-col">
              <Link href={`/leisure/${experience.id}`}>
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={experience.leisureListing.images[0]}
                    alt={experience.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="capitalize">
                      {experience.leisureListing.category}
                    </Badge>
                  </div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="text-lg font-semibold px-3 py-1">
                      {formatPrice(experience.leisureListing.price)}
                      {experience.leisureListing.priceType === 'PER_PERSON' && '/person'}
                    </Badge>
                  </div>
                  
                  {/* Host Info */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 border-2 border-white">
                        <AvatarImage src={experience.user.image} alt={experience.user.name} />
                        <AvatarFallback>
                          {experience.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium line-clamp-1">
                          {experience.user.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 fill-primary text-primary" />
                          <span>{experience.user.rating.toFixed(1)}</span>
                          <span>·</span>
                          <span>{formatNumber(experience._count.reviews)} reviews</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <CardContent className="p-6 flex-1 flex flex-col">
                <Link href={`/leisure/${experience.id}`}>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {experience.title}
                  </h3>
                </Link>

                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {experience.description}
                </p>

                <div className="space-y-2 mt-auto">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{experience.leisureListing.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{experience.leisureListing.duration}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{experience.leisureListing.availability}</span>
                  </div>

                  {experience.leisureListing.groupSize && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>
                        {experience.leisureListing.groupSize} {experience.leisureListing.groupSize === 1 ? 'person' : 'people'} max
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-full">
                      {formatNumber(experience._count.bookings)}+ booked
                    </Badge>
                    {experience.leisureListing.instant && (
                      <Badge variant="outline" className="rounded-full">
                        Instant Book
                      </Badge>
                    )}
                  </div>
                  <Button size="sm">Book Now</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}