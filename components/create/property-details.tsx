'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Home, Building2, Warehouse, Building } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useListingCreation } from '@/contexts/listing-creation-context';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  title: string;
  description: string;
  type: 'select' | 'number' | 'radio';
  options?: {
    value: string;
    label: string;
    icon?: any;
    description?: string;
  }[];
  validation: (value: any) => boolean;
  errorMessage: string;
}

const questions: Question[] = [
  {
    id: 'propertyType',
    title: 'What type of property is it?',
    description: 'Select the category that best describes your property',
    type: 'select',
    options: [
      {
        value: 'house',
        label: 'House',
        icon: Home,
        description: 'Single family home or villa',
      },
      {
        value: 'apartment',
        label: 'Apartment',
        icon: Building2,
        description: 'Flat or apartment in a building',
      },
      {
        value: 'commercial',
        label: 'Commercial',
        icon: Building,
        description: 'Office, retail, or other commercial space',
      },
      {
        value: 'industrial',
        label: 'Industrial',
        icon: Warehouse,
        description: 'Warehouse, factory, or industrial space',
      },
    ],
    validation: (value) => !!value,
    errorMessage: 'Please select a property type',
  },
  {
    id: 'status',
    title: 'Is this property for sale or rent?',
    description: 'Choose how you want to list your property',
    type: 'radio',
    options: [
      {
        value: 'FOR_SALE',
        label: 'For Sale',
        description: 'List your property for sale',
      },
      {
        value: 'FOR_RENT',
        label: 'For Rent',
        description: 'List your property for rent',
      },
    ],
    validation: (value) => !!value,
    errorMessage: 'Please select a listing type',
  },
  {
    id: 'bedrooms',
    title: 'How many bedrooms does it have?',
    description: 'Enter the number of bedrooms',
    type: 'number',
    validation: (value) => value > 0 && value <= 20,
    errorMessage: 'Please enter a valid number of bedrooms (1-20)',
  },
  {
    id: 'bathrooms',
    title: 'How many bathrooms does it have?',
    description: 'Enter the number of bathrooms',
    type: 'number',
    validation: (value) => value > 0 && value <= 10,
    errorMessage: 'Please enter a valid number of bathrooms (1-10)',
  },
  {
    id: 'size',
    title: 'What is the total size?',
    description: 'Enter the size in square meters',
    type: 'number',
    validation: (value) => value > 0 && value <= 10000,
    errorMessage: 'Please enter a valid size (1-10000 m²)',
  },
];

export function PropertyDetails() {
  const { state, updateData, nextStep } = useListingCreation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
    propertyType: state.data.property?.type || '',
    status: state.data.property?.status || '',
    bedrooms: state.data.property?.bedrooms || '',
    bathrooms: state.data.property?.bathrooms || '',
    size: state.data.property?.size || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAnswer = (value: any) => {
    const question = questions[currentQuestion];
    const isValid = question.validation(value);

    setAnswers(prev => ({
      ...prev,
      [question.id]: value,
    }));

    setErrors(prev => ({
      ...prev,
      [question.id]: isValid ? '' : question.errorMessage,
    }));

    if (isValid && currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 500);
    }
  };

  const handleContinue = () => {
    const question = questions[currentQuestion];
    const value = answers[question.id as keyof typeof answers];
    const isValid = question.validation(value);

    if (!isValid) {
      setErrors(prev => ({
        ...prev,
        [question.id]: question.errorMessage,
      }));
      return;
    }

    // If all questions are answered, update data and move to next step
    if (currentQuestion === questions.length - 1) {
      updateData({
        property: {
          type: answers.propertyType,
          status: answers.status as 'FOR_SALE' | 'FOR_RENT',
          bedrooms: Number(answers.bedrooms),
          bathrooms: Number(answers.bathrooms),
          size: Number(answers.size),
        },
      });
      nextStep();
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {questions.map((question, index) => (
          index === currentQuestion && (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Progress */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round((currentQuestion + 1) / questions.length * 100)}% complete</span>
              </div>

              {/* Question */}
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">{question.title}</h2>
                <p className="text-muted-foreground">{question.description}</p>
              </div>

              {/* Answer Options */}
              <div className="space-y-4">
                {question.type === 'select' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options?.map((option) => (
                      <Card
                        key={option.value}
                        className={cn(
                          "p-4 cursor-pointer transition-all hover:shadow-md",
                          answers[question.id as keyof typeof answers] === option.value && "ring-2 ring-primary"
                        )}
                        onClick={() => handleAnswer(option.value)}
                      >
                        <div className="flex items-start gap-4">
                          {option.icon && (
                            <option.icon className="w-6 h-6 text-primary" />
                          )}
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {question.type === 'radio' && (
                  <RadioGroup
                    value={answers[question.id as keyof typeof answers]}
                    onValueChange={handleAnswer}
                    className="space-y-4"
                  >
                    {question.options?.map((option) => (
                      <div key={option.value}>
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={option.value}
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-muted p-4 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                        >
                          <div className="font-semibold">{option.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {option.description}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.type === 'number' && (
                  <div className="max-w-xs mx-auto">
                    <Input
                      type="number"
                      value={answers[question.id as keyof typeof answers]}
                      onChange={(e) => handleAnswer(e.target.value)}
                      className="text-center text-lg h-12"
                      min={1}
                      max={question.id === 'size' ? 10000 : 20}
                    />
                  </div>
                )}

                {errors[question.id] && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-sm text-center"
                  >
                    {errors[question.id]}
                  </motion.p>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-end">
                <Button
                  onClick={handleContinue}
                  disabled={!answers[question.id as keyof typeof answers]}
                  className={cn(
                    "min-w-[120px] transition-all",
                    !errors[question.id] && answers[question.id as keyof typeof answers] && "bg-green-500 hover:bg-green-600"
                  )}
                >
                  {!errors[question.id] && answers[question.id as keyof typeof answers] ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <ChevronRight className="mr-2 h-4 w-4" />
                  )}
                  {currentQuestion === questions.length - 1 ? 'Continue' : 'Next'}
                </Button>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>
    </div>
  );
}