'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  Camera,
  FileText,
  Smartphone,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed';
}

export function VerificationLayout({
  children,
  className,
}: VerificationLayoutProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps: VerificationStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Verification',
      description: 'Let's get you verified in just a few steps',
      icon: <Shield className="h-6 w-6" />,
      status: currentStep === 0 ? 'active' : currentStep > 0 ? 'completed' : 'pending',
    },
    {
      id: 'identity',
      title: 'Identity Verification',
      description: 'Quick and secure identity check',
      icon: <Camera className="h-6 w-6" />,
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending',
    },
    {
      id: 'documents',
      title: 'Document Upload',
      description: 'Upload your required documents',
      icon: <FileText className="h-6 w-6" />,
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending',
    },
    {
      id: 'verification',
      title: 'Final Verification',
      description: 'Complete your verification',
      icon: <CheckCircle className="h-6 w-6" />,
      status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending',
    },
  ];

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg transition-all duration-200',
          isScrolled && 'border-b shadow-sm'
        )}
      >
        <div className="container mx-auto">
          <div className="flex h-16 items-center justify-between">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-4"
            >
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-lg font-semibold">
                  {steps[currentStep].title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {steps[currentStep].description}
                </p>
              </div>
            </motion.div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto pt-24 pb-16">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - Progress */}
          <div className="col-span-3">
            <div className="sticky top-24 space-y-1">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'group relative flex items-center space-x-4 rounded-lg px-4 py-3 transition-all',
                    step.status === 'active' &&
                      'bg-primary/5 text-primary',
                    step.status === 'completed' &&
                      'text-muted-foreground hover:bg-muted',
                    step.status === 'pending' &&
                      'text-muted-foreground opacity-50'
                  )}
                >
                  {/* Progress Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'absolute left-6 top-12 h-[calc(100%+0.75rem)] w-px bg-muted',
                        step.status === 'completed' && 'bg-primary'
                      )}
                    />
                  )}

                  {/* Step Icon */}
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background transition-colors',
                      step.status === 'active' &&
                        'border-primary',
                      step.status === 'completed' &&
                        'border-primary bg-primary text-primary-foreground'
                    )}
                  >
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <h3 className="font-medium leading-none">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  {/* Status Icon */}
                  {step.status === 'active' && (
                    <ArrowRight className="h-5 w-5 text-primary" />
                  )}
                  {step.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border bg-card p-8 shadow-sm"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Help Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto py-12">
          <div className="grid grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="font-medium">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                Our support team is here to help you with the verification process.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="font-medium">Contact Support</h3>
              <p className="text-sm text-muted-foreground">
                Email us at support@greia.com for assistance.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-medium">Documentation</h3>
              <p className="text-sm text-muted-foreground">
                View our verification guide and FAQs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}