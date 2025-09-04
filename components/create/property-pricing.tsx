'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Euro, TrendingUp, ArrowRight, Check, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useListingCreation } from '@/contexts/listing-creation-context';
import { cn, formatPrice } from '@/lib/utils';

interface PriceSuggestion {
  label: string;
  value: number;
  description: string;
}

export function PropertyPricing() {
  const { state, updateData, nextStep } = useListingCreation();
  const [price, setPrice] = useState<number>(state.data.property?.price || 0);
  const [suggestions, setSuggestions] = useState<PriceSuggestion[]>([]);
  const [currentStep, setCurrentStep] = useState<'suggestion' | 'custom'>('suggestion');
  const [error, setError] = useState('');

  // Generate price suggestions based on property details
  useEffect(() => {
    const basePrice = calculateBasePrice();
    setSuggestions([
      {
        label: 'Competitive',
        value: Math.round(basePrice * 0.9),
        description: 'Attract more interest with a competitive price',
      },
      {
        label: 'Recommended',
        value: basePrice,
        description: 'Based on similar properties in the area',
      },
      {
        label: 'Premium',
        value: Math.round(basePrice * 1.1),
        description: 'Highlight premium features and location',
      },
    ]);
  }, []);

  // Calculate base price using property details
  const calculateBasePrice = () => {
    const { property } = state.data;
    if (!property) return 0;

    // Basic calculation based on type, size, and features
    let basePrice = 0;
    const pricePerSqm = property.status === 'FOR_SALE' ? 2500 : 15;
    
    basePrice = property.size * pricePerSqm;

    // Adjust for bedrooms and bathrooms
    basePrice += (property.bedrooms * 10000);
    basePrice += (property.bathrooms * 5000);

    // Adjust for features
    if (property.features) {
      basePrice += (property.features.length * 2000);
    }

    return Math.round(basePrice);
  };

  const validatePrice = (value: number) => {
    if (value <= 0) {
      setError('Please enter a valid price');
      return false;
    }
    
    const minPrice = Math.min(...suggestions.map(s => s.value)) * 0.5;
    const maxPrice = Math.max(...suggestions.map(s => s.value)) * 2;

    if (value < minPrice) {
      setError('Price seems unusually low. Please verify.');
      return false;
    }

    if (value > maxPrice) {
      setError('Price seems unusually high. Please verify.');
      return false;
    }

    setError('');
    return true;
  };

  const handlePriceSelect = (value: number) => {
    setPrice(value);
    if (validatePrice(value)) {
      setTimeout(() => {
        setCurrentStep('custom');
      }, 500);
    }
  };

  const handleCustomPrice = (value: string) => {
    const numValue = Number(value.replace(/[^0-9]/g, ''));
    setPrice(numValue);
    validatePrice(numValue);
  };

  const handleContinue = () => {
    if (validatePrice(price)) {
      updateData({
        property: {
          ...state.data.property,
          price,
        },
      });
      nextStep();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {currentStep === 'suggestion' ? (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">
                Suggested Pricing
              </h2>
              <p className="text-muted-foreground">
                Choose a pricing strategy for your property
              </p>
            </div>

            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <Card
                  key={suggestion.label}
                  className={cn(
                    "p-6 cursor-pointer transition-all hover:shadow-md",
                    price === suggestion.value && "ring-2 ring-primary"
                  )}
                  onClick={() => handlePriceSelect(suggestion.value)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-lg">
                      {suggestion.label}
                    </div>
                    <div className="text-xl font-bold text-primary flex items-center">
                      <Euro className="w-5 h-5 mr-1" />
                      {formatPrice(suggestion.value, false)}
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    {suggestion.description}
                  </p>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep('custom')}
              >
                Set custom price
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="custom"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">
                Set Your Price
              </h2>
              <p className="text-muted-foreground">
                Fine-tune your listing price
              </p>
            </div>

            <div className="space-y-6">
              {/* Price Input */}
              <div className="relative max-w-xs mx-auto">
                <Euro className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={formatPrice(price, false)}
                  onChange={(e) => handleCustomPrice(e.target.value)}
                  className="pl-10 text-lg h-12 text-center font-semibold"
                />
              </div>

              {/* Price Slider */}
              <div className="px-4">
                <Slider
                  value={[price]}
                  min={Math.min(...suggestions.map(s => s.value)) * 0.5}
                  max={Math.max(...suggestions.map(s => s.value)) * 1.5}
                  step={1000}
                  onValueChange={([value]) => handlePriceSelect(value)}
                  className="my-6"
                />
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Min: €{formatPrice(Math.min(...suggestions.map(s => s.value)), false)}</span>
                  <span>Max: €{formatPrice(Math.max(...suggestions.map(s => s.value)), false)}</span>
                </div>
              </div>

              {/* Market Analysis */}
              <Card className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Market Analysis</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Average in area</span>
                    <span>€{formatPrice(suggestions[1].value, false)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per m²</span>
                    <span>€{formatPrice(Math.round(price / state.data.property!.size), false)}/m²</span>
                  </div>
                </div>
              </Card>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-destructive text-sm justify-center"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('suggestion')}
              >
                View suggestions
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!price || !!error}
                className={cn(
                  "min-w-[120px]",
                  !error && price && "bg-green-500 hover:bg-green-600"
                )}
              >
                {!error && price ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Continue
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}