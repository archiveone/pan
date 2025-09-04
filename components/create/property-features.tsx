'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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
  Check,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useListingCreation } from '@/contexts/listing-creation-context';
import { cn } from '@/lib/utils';

interface Feature {
  id: string;
  label: string;
  icon: any;
  category: string;
}

const features: Feature[] = [
  // Amenities
  { id: 'wifi', label: 'WiFi', icon: Wifi, category: 'Amenities' },
  { id: 'parking', label: 'Parking', icon: Parking, category: 'Amenities' },
  { id: 'tv', label: 'TV', icon: Tv, category: 'Amenities' },
  { id: 'heating', label: 'Heating', icon: Thermometer, category: 'Amenities' },
  
  // Utilities
  { id: 'water', label: 'Water', icon: Droplets, category: 'Utilities' },
  { id: 'security', label: 'Security', icon: Lock, category: 'Utilities' },
  { id: 'storage', label: 'Storage', icon: Warehouse, category: 'Utilities' },
  { id: 'electricity', label: 'Electricity', icon: Plug, category: 'Utilities' },
  
  // Features
  { id: 'garden', label: 'Garden', icon: Trees, category: 'Features' },
  { id: 'furnished', label: 'Furnished', icon: Sofa, category: 'Features' },
  { id: 'kitchen', label: 'Kitchen', icon: Utensils, category: 'Features' },
  { id: 'access', label: 'Easy Access', icon: Footprints, category: 'Features' },
];

const categories = Array.from(new Set(features.map(f => f.category)));

export function PropertyFeatures() {
  const { state, updateData, nextStep } = useListingCreation();
  const [currentCategory, setCurrentCategory] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    state.data.property?.features || []
  );

  const currentFeatures = features.filter(f => f.category === categories[currentCategory]);

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => {
      if (prev.includes(featureId)) {
        return prev.filter(id => id !== featureId);
      }
      return [...prev, featureId];
    });
  };

  const handleContinue = () => {
    if (currentCategory < categories.length - 1) {
      setCurrentCategory(prev => prev + 1);
    } else {
      updateData({
        property: {
          ...state.data.property,
          features: selectedFeatures,
        },
      });
      nextStep();
    }
  };

  const isCurrentCategoryValid = currentFeatures.some(f => 
    selectedFeatures.includes(f.id)
  );

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={categories[currentCategory]}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Category {currentCategory + 1} of {categories.length}</span>
            <span>{Math.round((currentCategory + 1) / categories.length * 100)}% complete</span>
          </div>

          {/* Category Title */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">
              Select {categories[currentCategory]}
            </h2>
            <p className="text-muted-foreground">
              Choose all that apply to your property
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {currentFeatures.map((feature) => {
              const isSelected = selectedFeatures.includes(feature.id);
              return (
                <Card
                  key={feature.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:shadow-md",
                    isSelected && "ring-2 ring-primary bg-primary/5"
                  )}
                  onClick={() => toggleFeature(feature.id)}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={cn(
                      "p-2 rounded-full",
                      isSelected ? "bg-primary text-white" : "bg-muted"
                    )}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <span className="font-medium">{feature.label}</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentCategory(prev => prev - 1)}
              disabled={currentCategory === 0}
            >
              Back
            </Button>

            <div className="flex items-center gap-2">
              {/* Category Indicators */}
              <div className="flex gap-1">
                {categories.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentCategory
                        ? "bg-primary"
                        : index < currentCategory
                        ? "bg-primary/50"
                        : "bg-gray-200"
                    )}
                  />
                ))}
              </div>

              <Button
                onClick={handleContinue}
                disabled={!isCurrentCategoryValid}
                className={cn(
                  "min-w-[120px] transition-all",
                  isCurrentCategoryValid && "bg-green-500 hover:bg-green-600"
                )}
              >
                {isCurrentCategoryValid ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <ChevronRight className="mr-2 h-4 w-4" />
                )}
                {currentCategory === categories.length - 1 ? 'Continue' : 'Next'}
              </Button>
            </div>
          </div>

          {/* Selected Count */}
          <div className="text-center text-sm text-muted-foreground">
            {selectedFeatures.filter(f => 
              features.find(feat => feat.id === f)?.category === categories[currentCategory]
            ).length} {categories[currentCategory]} selected
          </div>

          {/* Skip Option */}
          {!isCurrentCategoryValid && (
            <div className="text-center">
              <Button
                variant="ghost"
                className="text-sm text-muted-foreground"
                onClick={handleContinue}
              >
                Skip this category
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}