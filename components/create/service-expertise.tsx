'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, 
  Briefcase, 
  GraduationCap, 
  Award,
  Clock,
  FileCheck,
  Check,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useListingCreation } from '@/contexts/listing-creation-context';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  title: string;
  description: string;
  type: 'select' | 'input' | 'multi-select';
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
    id: 'expertise',
    title: 'What are your areas of expertise?',
    description: 'Select all that apply to your service',
    type: 'multi-select',
    options: [
      {
        value: 'plumbing',
        label: 'Plumbing',
        icon: Wrench,
        description: 'Installation, repair, and maintenance',
      },
      {
        value: 'electrical',
        label: 'Electrical',
        icon: Wrench,
        description: 'Wiring, fixtures, and electrical systems',
      },
      {
        value: 'consulting',
        label: 'Consulting',
        icon: Briefcase,
        description: 'Professional advice and guidance',
      },
      // Add more options based on service categories
    ],
    validation: (values: string[]) => values.length > 0,
    errorMessage: 'Please select at least one area of expertise',
  },
  {
    id: 'experience',
    title: 'How many years of experience do you have?',
    description: 'Select your level of experience',
    type: 'select',
    options: [
      {
        value: '1-3',
        label: '1-3 years',
        icon: Clock,
        description: 'Early career professional',
      },
      {
        value: '4-7',
        label: '4-7 years',
        icon: Clock,
        description: 'Mid-level experience',
      },
      {
        value: '8-12',
        label: '8-12 years',
        icon: Clock,
        description: 'Senior professional',
      },
      {
        value: '13+',
        label: '13+ years',
        icon: Clock,
        description: 'Expert level experience',
      },
    ],
    validation: (value: string) => !!value,
    errorMessage: 'Please select your experience level',
  },
  {
    id: 'qualifications',
    title: 'What are your qualifications?',
    description: 'Add your certifications and qualifications',
    type: 'input',
    validation: (values: string[]) => values.length > 0,
    errorMessage: 'Please add at least one qualification',
  },
];

export function ServiceExpertise() {
  const { state, updateData, nextStep } = useListingCreation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
    expertise: state.data.service?.expertise || [],
    experience: state.data.service?.experience || '',
    qualifications: state.data.service?.qualifications || [],
  });
  const [newQualification, setNewQualification] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAnswer = (questionId: string, value: any) => {
    const question = questions.find(q => q.id === questionId)!;
    
    let newValue = value;
    if (question.type === 'multi-select') {
      newValue = answers[questionId as keyof typeof answers].includes(value)
        ? answers[questionId as keyof typeof answers].filter((v: string) => v !== value)
        : [...answers[questionId as keyof typeof answers], value];
    }

    const isValid = question.validation(newValue);
    setAnswers(prev => ({
      ...prev,
      [questionId]: newValue,
    }));
    setErrors(prev => ({
      ...prev,
      [questionId]: isValid ? '' : question.errorMessage,
    }));

    if (isValid && question.type === 'select') {
      setTimeout(() => {
        handleNext();
      }, 500);
    }
  };

  const addQualification = () => {
    if (newQualification.trim()) {
      setAnswers(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()],
      }));
      setNewQualification('');
    }
  };

  const removeQualification = (index: number) => {
    setAnswers(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
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

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      updateData({
        service: {
          ...state.data.service,
          expertise: answers.expertise,
          experience: answers.experience,
          qualifications: answers.qualifications,
        },
      });
      nextStep();
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
                {question.type === 'multi-select' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options?.map((option) => {
                      const isSelected = answers[question.id as keyof typeof answers].includes(option.value);
                      return (
                        <Card
                          key={option.value}
                          className={cn(
                            "p-4 cursor-pointer transition-all hover:shadow-md",
                            isSelected && "ring-2 ring-primary bg-primary/5"
                          )}
                          onClick={() => handleAnswer(question.id, option.value)}
                        >
                          <div className="flex items-start gap-4">
                            {option.icon && (
                              <div className={cn(
                                "p-2 rounded-full",
                                isSelected ? "bg-primary text-white" : "bg-muted"
                              )}>
                                <option.icon className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {question.type === 'select' && (
                  <div className="grid grid-cols-1 gap-4">
                    {question.options?.map((option) => {
                      const isSelected = answers[question.id as keyof typeof answers] === option.value;
                      return (
                        <Card
                          key={option.value}
                          className={cn(
                            "p-4 cursor-pointer transition-all hover:shadow-md",
                            isSelected && "ring-2 ring-primary bg-primary/5"
                          )}
                          onClick={() => handleAnswer(question.id, option.value)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {option.icon && (
                                <div className={cn(
                                  "p-2 rounded-full",
                                  isSelected ? "bg-primary text-white" : "bg-muted"
                                )}>
                                  <option.icon className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-sm text-muted-foreground">
                                  {option.description}
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {question.type === 'input' && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newQualification}
                        onChange={(e) => setNewQualification(e.target.value)}
                        placeholder="Add a qualification..."
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addQualification();
                          }
                        }}
                      />
                      <Button
                        onClick={addQualification}
                        disabled={!newQualification.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {answers.qualifications.map((qual, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="pl-2 pr-1 py-1"
                        >
                          {qual}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 hover:bg-transparent"
                            onClick={() => removeQualification(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
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
                  onClick={handleNext}
                  disabled={!answers[question.id as keyof typeof answers] || 
                    (Array.isArray(answers[question.id as keyof typeof answers]) && 
                    answers[question.id as keyof typeof answers].length === 0)}
                  className={cn(
                    "min-w-[120px]",
                    !errors[question.id] && answers[question.id as keyof typeof answers] && 
                    "bg-green-500 hover:bg-green-600"
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