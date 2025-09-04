'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check,
  ChevronDown,
  Wifi,
  Parking,
  Tv,
  Thermometer,
  Droplets,
  Lock,
  Warehouse,
  Trees,
  Sofa,
  Utensils,
  Footprints,
  Plug,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Map feature keys to icons
const featureIcons: Record<string, any> = {
  'wifi': Wifi,
  'parking': Parking,
  'tv': Tv,
  'heating': Thermometer,
  'water': Droplets,
  'security': Lock,
  'storage': Warehouse,
  'garden': Trees,
  'furnished': Sofa,
  'kitchen': Utensils,
  'access': Footprints,
  'electricity': Plug,
};

interface PropertyFeaturesProps {
  features: string[];
  specifications: Record<string, any>;
}

export function PropertyFeatures({ 
  features, 
  specifications 
}: PropertyFeaturesProps) {
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  const displayedFeatures = showAllFeatures ? features : features.slice(0, 8);
  const hasMoreFeatures = features.length > 8;

  // Group specifications by category
  const specCategories = {
    'Building Details': ['yearBuilt', 'floors', 'condition', 'style'],
    'Interior': ['heating', 'cooling', 'basement', 'flooring'],
    'Exterior': ['roof', 'parking', 'garage', 'lot'],
    'Utilities': ['water', 'electricity', 'sewage', 'internet'],
  };

  return (
    <div className="space-y-8">
      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features & Amenities</CardTitle>
          <CardDescription>
            Key features and amenities this property offers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            layout
          >
            <AnimatePresence>
              {displayedFeatures.map((feature, index) => {
                const Icon = featureIcons[feature.toLowerCase()] || Check;
                return (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="capitalize">{feature}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {hasMoreFeatures && (
            <Button
              variant="ghost"
              className="mt-4 w-full"
              onClick={() => setShowAllFeatures(!showAllFeatures)}
            >
              {showAllFeatures ? 'Show Less' : `Show All (${features.length})`}
              <ChevronDown 
                className={`ml-2 h-4 w-4 transition-transform ${
                  showAllFeatures ? 'rotate-180' : ''
                }`}
              />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Property Specifications</CardTitle>
          <CardDescription>
            Detailed specifications and technical details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(specCategories).map(([category, fields], index) => {
              const categorySpecs = fields.filter(field => specifications[field]);
              if (categorySpecs.length === 0) return null;

              return (
                <div key={category}>
                  {index > 0 && <Separator className="my-6" />}
                  <h3 className="font-semibold mb-4">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categorySpecs.map(field => (
                      <div key={field} className="flex items-center justify-between">
                        <span className="text-muted-foreground capitalize">
                          {field.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <Badge variant="secondary">
                          {specifications[field]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}