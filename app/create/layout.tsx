'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useListingCreation } from '@/contexts/listing-creation-context';
import { useToast } from '@/components/ui/use-toast';

export default function CreateListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { 
    state, 
    prevStep, 
    getTotalSteps,
    isStepValid 
  } = useListingCreation();

  // Prevent accessing creation steps directly without type selection
  useEffect(() => {
    if (pathname !== '/create' && !state.type) {
      router.replace('/create');
      toast({
        title: 'Please start from the beginning',
        description: 'Select what type of listing you want to create first.',
      });
    }
  }, [pathname, state.type, router, toast]);

  // Handle exit confirmation
  const handleExit = () => {
    // Show confirmation dialog if there's data
    if (Object.keys(state.data).some(key => state.data[key])) {
      const confirmed = window.confirm(
        'Are you sure you want to exit? All progress will be lost.'
      );
      if (!confirmed) return;
    }
    router.push('/');
  };

  // Handle back navigation
  const handleBack = () => {
    if (pathname === '/create') {
      handleExit();
    } else {
      prevStep();
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Logo and Progress */}
          <div className="flex-1 max-w-md mx-4">
            <div className="flex items-center justify-center mb-1">
              <Image
                src="/greia-full-logo.png"
                alt="GREIA"
                width={120}
                height={48}
                className="dark:invert"
              />
            </div>
            {state.type && (
              <Progress 
                value={state.progress} 
                className="h-1"
              />
            )}
          </div>

          {/* Exit Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExit}
            className="shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="container mx-auto px-4 py-8"
      >
        {/* Step Indicators */}
        {state.type && (
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: getTotalSteps() }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i + 1 === state.step
                    ? 'bg-primary'
                    : i + 1 < state.step
                    ? 'bg-primary/50'
                    : 'bg-gray-200'
                } ${isStepValid(i + 1) ? 'ring-2 ring-primary/20' : ''}`}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </motion.main>

      {/* Help Text */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <p className="text-sm text-muted-foreground">
            Need help?{' '}
            <button 
              onClick={() => window.open('/help', '_blank')}
              className="text-primary hover:underline"
            >
              View guidelines
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}