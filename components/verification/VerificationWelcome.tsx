'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  CheckCircle,
  Clock,
  Lock,
  UserCheck,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface VerificationWelcomeProps {
  onStart: () => void;
  type?: 'user' | 'agent';
  className?: string;
}

export function VerificationWelcome({
  onStart,
  type = 'user',
  className,
}: VerificationWelcomeProps) {
  const features = [
    {
      icon: <Clock className="h-5 w-5" />,
      title: 'Quick Process',
      description: 'Complete verification in under 5 minutes',
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: 'Secure & Private',
      description: 'Bank-level security for your data',
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: 'Instant Verification',
      description: 'Get verified immediately after approval',
    },
  ];

  const verificationTypes = {
    user: {
      title: 'Get Verified on GREIA',
      description:
        'Verify your identity to unlock all features and build trust in the community.',
      benefits: [
        'Access to all platform features',
        'Higher visibility in searches',
        'Verified badge on your profile',
        'Priority support access',
      ],
      requirements: [
        'Government-issued photo ID',
        'Proof of address',
        'Working camera for selfie',
        'Few minutes of your time',
      ],
    },
    agent: {
      title: 'Agent Verification',
      description:
        'Verify your professional status to showcase your expertise and build client trust.',
      benefits: [
        'Professional agent badge',
        'Priority listing placement',
        'Access to premium tools',
        'Enhanced profile visibility',
        'Client review management',
        'Marketing tools access',
      ],
      requirements: [
        'Real estate license',
        'Professional insurance',
        'Business registration',
        'Agency details',
      ],
    },
  };

  const content = verificationTypes[type];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
        >
          <Shield className="h-8 w-8 text-primary" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold tracking-tight"
        >
          {content.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-2 text-muted-foreground"
        >
          {content.description}
        </motion.p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-3 gap-4"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="rounded-xl border bg-card p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              {feature.icon}
            </div>
            <h3 className="mt-4 font-medium">{feature.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Benefits & Requirements */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5 text-primary" />
                Benefits
              </CardTitle>
              <CardDescription>
                What you'll get after verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {content.benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center text-sm"
                  >
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5 text-primary" />
                Requirements
              </CardTitle>
              <CardDescription>
                What you'll need to get verified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {content.requirements.map((requirement, index) => (
                  <motion.li
                    key={requirement}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center text-sm"
                  >
                    <ArrowRight className="mr-2 h-4 w-4 text-primary" />
                    {requirement}
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex justify-center pt-6"
      >
        <Button
          size="lg"
          onClick={onStart}
          className="group relative overflow-hidden px-8"
        >
          <span className="relative z-10">Start Verification</span>
          <motion.div
            initial={{ x: '-100%' }}
            whileHover={{ x: 0 }}
            className="absolute inset-0 z-0 bg-primary-foreground/10"
          />
        </Button>
      </motion.div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 flex items-center justify-center space-x-6 text-sm text-muted-foreground"
      >
        <span className="flex items-center">
          <Lock className="mr-2 h-4 w-4" />
          Bank-level Security
        </span>
        <span className="flex items-center">
          <Shield className="mr-2 h-4 w-4" />
          Data Protection
        </span>
        <span className="flex items-center">
          <CheckCircle className="mr-2 h-4 w-4" />
          Instant Processing
        </span>
      </motion.div>
    </div>
  );
}