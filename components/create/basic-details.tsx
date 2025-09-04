'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, MapPin, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useListingCreation } from '@/contexts/listing-creation-context';
import { cn } from '@/lib/utils';

interface Field {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'location';
  validation: (value: string) => boolean;
  errorMessage: string;
}

const fields: Field[] = [
  {
    id: 'title',
    label: 'Give your listing a great title',
    placeholder: 'Enter a clear, descriptive title',
    type: 'text',
    validation: (value) => value.length >= 10 && value.length <= 100,
    errorMessage: 'Title should be between 10 and 100 characters',
  },
  {
    id: 'description',
    label: 'Describe your listing in detail',
    placeholder: 'Provide a detailed description...',
    type: 'textarea',
    validation: (value) => value.length >= 50 && value.length <= 2000,
    errorMessage: 'Description should be between 50 and 2000 characters',
  },
  {
    id: 'location',
    label: 'Where is your listing located?',
    placeholder: 'Enter the location',
    type: 'location',
    validation: (value) => value.length >= 5,
    errorMessage: 'Please enter a valid location',
  },
];

export function BasicDetails() {
  const { state, updateData, nextStep } = useListingCreation();
  const [currentField, setCurrentField] = useState(0);
  const [values, setValues] = useState({
    title: state.data.title || '',
    description: state.data.description || '',
    location: state.data.location || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  // Validate current field
  useEffect(() => {
    const field = fields[currentField];
    const value = values[field.id as keyof typeof values];
    const isFieldValid = field.validation(value);
    setIsValid(isFieldValid);
    setErrors(prev => ({
      ...prev,
      [field.id]: isFieldValid ? '' : field.errorMessage,
    }));
  }, [currentField, values]);

  const handleNext = () => {
    const field = fields[currentField];
    if (!isValid) return;

    if (currentField < fields.length - 1) {
      setCurrentField(prev => prev + 1);
    } else {
      // Save data and move to next step
      updateData(values);
      nextStep();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && isValid) {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {fields.map((field, index) => (
          index === currentField && (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Question {currentField + 1} of {fields.length}</span>
                <span>{Math.round((currentField + 1) / fields.length * 100)}% complete</span>
              </div>

              {/* Field Label */}
              <h2 className="text-2xl font-semibold text-center mb-8">
                {field.label}
              </h2>

              {/* Field Input */}
              <div className="space-y-4">
                {field.type === 'textarea' ? (
                  <Textarea
                    value={values[field.id as keyof typeof values]}
                    onChange={(e) => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="min-h-[150px] text-lg"
                    onKeyDown={handleKeyPress}
                  />
                ) : field.type === 'location' ? (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-6 w-6 text-muted-foreground" />
                    <Input
                      value={values[field.id as keyof typeof values]}
                      onChange={(e) => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="pl-12 h-12 text-lg"
                      onKeyDown={handleKeyPress}
                    />
                  </div>
                ) : (
                  <Input
                    value={values[field.id as keyof typeof values]}
                    onChange={(e) => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="h-12 text-lg"
                    onKeyDown={handleKeyPress}
                  />
                )}

                {/* Error Message */}
                <AnimatePresence>
                  {errors[field.id] && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 text-destructive text-sm"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors[field.id]}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Character Count for Text Fields */}
                {(field.type === 'text' || field.type === 'textarea') && (
                  <div className="text-sm text-muted-foreground text-right">
                    {values[field.id as keyof typeof values].length} characters
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleNext}
                  disabled={!isValid}
                  className={cn(
                    "min-w-[120px] transition-all",
                    isValid && "bg-green-500 hover:bg-green-600"
                  )}
                >
                  {isValid ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <ChevronRight className="mr-2 h-4 w-4" />
                  )}
                  {currentField === fields.length - 1 ? 'Continue' : 'Next'}
                </Button>
              </div>

              {/* Keyboard Shortcut Hint */}
              <p className="text-center text-sm text-muted-foreground mt-4">
                Press Enter ↵ to continue
              </p>
            </motion.div>
          )
        ))}
      </AnimatePresence>
    </div>
  );
}