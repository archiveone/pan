import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SignupStep {
  id: number;
  title: string;
  description: string;
  fields: {
    name: string;
    label: string;
    type: string;
    placeholder: string;
  }[];
}

const signupSteps: SignupStep[] = [
  {
    id: 1,
    title: "Let's get started! 🎉",
    description: "First, tell us your name",
    fields: [
      {
        name: 'fullName',
        label: 'Full Name',
        type: 'text',
        placeholder: 'Enter your full name'
      }
    ]
  },
  {
    id: 2,
    title: "Great! Now your email 📧",
    description: "We'll send you a confirmation link",
    fields: [
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'Enter your email'
      }
    ]
  },
  {
    id: 3,
    title: "Create a password 🔐",
    description: "Make it strong and memorable",
    fields: [
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Enter your password'
      },
      {
        name: 'confirmPassword',
        label: 'Confirm Password',
        type: 'password',
        placeholder: 'Confirm your password'
      }
    ]
  },
  {
    id: 4,
    title: "What brings you to GREIA? 🌟",
    description: "Select your primary interest",
    fields: [
      {
        name: 'interest',
        label: 'Primary Interest',
        type: 'select',
        placeholder: 'Choose your interest'
      }
    ]
  }
];

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);

  const progress = (currentStep / signupSteps.length) * 100;

  const handleNext = async () => {
    setIsAnimating(true);
    
    // Simulate form validation
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (currentStep < signupSteps.length) {
      // Show sparkles effect
      const sparkles = Array.from({ length: 3 }).map((_, i) => {
        const angle = (i / 3) * Math.PI * 2;
        return {
          x: Math.cos(angle) * 100,
          y: Math.sin(angle) * 100,
          scale: Math.random() * 0.5 + 0.5,
          rotation: Math.random() * 360
        };
      });

      sparkles.forEach(spark => {
        confetti({
          particleCount: 3,
          spread: 60,
          origin: { x: 0.5 + spark.x / window.innerWidth, y: 0.5 + spark.y / window.innerHeight },
          colors: ['#2B59FF', '#BB2BFF', '#FF2B2B']
        });
      });

      setCurrentStep(prev => prev + 1);
    } else {
      // Show completion celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      // Handle form submission
    }
    
    setIsAnimating(false);
  };

  const currentStepData = signupSteps[currentStep - 1];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="h-2 bg-gradient-to-r from-[#2B59FF] via-[#BB2BFF] to-[#FF2B2B]" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link href="/">
              <div className="relative h-12 w-40 mx-auto">
                <Image
                  src="/images/greia-logo-gradient.svg"
                  alt="GREIA"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Step {currentStep} of {signupSteps.length}
            </p>
          </div>

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-lg shadow-lg"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-2xl font-bold mb-2">{currentStepData.title}</h1>
                <p className="text-muted-foreground mb-6">{currentStepData.description}</p>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  {currentStepData.fields.map((field) => (
                    <div key={field.name}>
                      <Label htmlFor={field.name}>{field.label}</Label>
                      <Input
                        id={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        className="mt-1"
                      />
                    </div>
                  ))}

                  <div className="pt-4">
                    <Button
                      onClick={handleNext}
                      disabled={isAnimating}
                      className="w-full relative"
                    >
                      {isAnimating ? (
                        <Sparkles className="h-5 w-5 animate-spin" />
                      ) : currentStep === signupSteps.length ? (
                        <>
                          Complete Sign Up
                          <CheckCircle2 className="ml-2 h-5 w-5" />
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Sign In Link */}
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}