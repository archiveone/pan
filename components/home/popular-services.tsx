'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, ArrowRight, MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';

interface PopularServicesProps {
  services: any[]; // Replace with proper type
}

export function PopularServices({ services }: PopularServicesProps) {
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
          <h2 className="text-3xl font-bold mb-2">Popular Services</h2>
          <p className="text-muted-foreground">
            Connect with top-rated service providers in your area
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/services" className="flex items-center gap-2">
            View All Services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {services.map((service) => (
          <motion.div key={service.id} variants={itemVariants}>
            <Card className="group h-full flex flex-col">
              <CardContent className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <Link href={`/profile/${service.user.id}`} className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary">
                      <AvatarImage src={service.user.image} alt={service.user.name} />
                      <AvatarFallback>
                        {service.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold line-clamp-1">
                        {service.user.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span>{service.user.rating.toFixed(1)}</span>
                        <span>·</span>
                        <span>{formatNumber(service._count.reviews)} reviews</span>
                      </div>
                    </div>
                  </Link>
                  
                  <Badge variant="outline" className="capitalize">
                    {service.serviceListing.category}
                  </Badge>
                </div>

                <Link href={`/services/${service.id}`}>
                  <h4 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {service.title}
                  </h4>
                </Link>

                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {service.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{service.serviceListing.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Response time: {service.serviceListing.responseTime}</span>
                  </div>

                  {service.serviceListing.expertise && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {service.serviceListing.expertise.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {service.serviceListing.expertise.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{service.serviceListing.expertise.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>

              <div className="p-6 pt-0 mt-auto">
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="font-semibold">
                    From {service.serviceListing.rateType === 'HOURLY' ? '£' + service.serviceListing.rate + '/hr' : '£' + service.serviceListing.rate}
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Contact
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}