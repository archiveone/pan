'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  VerificationLevel,
  VERIFICATION_LEVELS,
} from '@/lib/verification/VerificationService';

interface VerificationFormProps {
  userId: string;
  currentLevel?: number;
  onComplete?: () => void;
  className?: string;
}

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  required: boolean;
}

export function VerificationForm({
  userId,
  currentLevel = 0,
  onComplete,
  className,
}: VerificationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [selectedLevel, setSelectedLevel] = useState<VerificationLevel>(
    VERIFICATION_LEVELS[0]
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<
    'pending' | 'processing' | 'approved' | 'rejected'
  >('pending');

  const steps: VerificationStep[] = [
    {
      id: 'level-selection',
      title: 'Select Verification Level',
      description: 'Choose the verification level you want to achieve',
      component: (
        <div className="space-y-4">
          {VERIFICATION_LEVELS.map((level) => (
            <Card
              key={level.level}
              className={cn(
                'cursor-pointer transition-all hover:border-primary',
                selectedLevel.level === level.level && 'border-primary bg-primary/5'
              )}
              onClick={() => setSelectedLevel(level)}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  {level.name}
                </CardTitle>
                <CardDescription>Level {level.level}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium">Requirements:</h4>
                  <ul className="list-inside list-disc space-y-1">
                    {level.requirements.map((req) => (
                      <li key={req.type}>
                        {req.description}
                        {req.required && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Separator className="my-4" />
                  <h4 className="font-medium">Benefits:</h4>
                  <ul className="list-inside list-disc space-y-1">
                    {level.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ),
      required: true,
    },
    {
      id: 'identity-verification',
      title: 'Identity Verification',
      description: 'Verify your identity with government-issued ID',
      component: (
        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Accepted Documents</h3>
            <ul className="list-inside list-disc space-y-1">
              <li>Passport</li>
              <li>Driver's License</li>
              <li>National ID Card</li>
            </ul>
          </div>

          <div className="space-y-4">
            <FormField
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="driving_license">
                        Driver's License
                      </SelectItem>
                      <SelectItem value="national_id">
                        National ID Card
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="documentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter document number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Upload Document</Label>
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Drag and drop your document here, or{' '}
                  <span className="text-primary">browse</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supported formats: PDF, JPG, PNG (max 10MB)
                </p>
              </div>
              {uploadProgress > 0 && (
                <div className="space-y-1">
                  <Progress value={uploadProgress} />
                  <p className="text-xs text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      required: true,
    },
    {
      id: 'address-verification',
      title: 'Address Verification',
      description: 'Verify your current address',
      component: (
        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Accepted Documents</h3>
            <ul className="list-inside list-disc space-y-1">
              <li>Utility Bill (less than 3 months old)</li>
              <li>Bank Statement (less than 3 months old)</li>
              <li>Council Tax Bill</li>
            </ul>
          </div>

          <div className="space-y-4">
            <FormField
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utility_bill">Utility Bill</SelectItem>
                      <SelectItem value="bank_statement">
                        Bank Statement
                      </SelectItem>
                      <SelectItem value="council_tax">
                        Council Tax Bill
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Upload Document</Label>
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Drag and drop your document here, or{' '}
                  <span className="text-primary">browse</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supported formats: PDF, JPG, PNG (max 10MB)
                </p>
              </div>
              {uploadProgress > 0 && (
                <div className="space-y-1">
                  <Progress value={uploadProgress} />
                  <p className="text-xs text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      required: true,
    },
  ];

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setVerificationStatus('processing');

      // Call verification service
      const response = await fetch('/api/verification/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          level: selectedLevel.level,
          // Add other verification data
        }),
      });

      if (!response.ok) {
        throw new Error('Verification request failed');
      }

      const data = await response.json();

      // Show success message
      toast({
        title: 'Verification Submitted',
        description: 'Your verification request has been submitted successfully.',
        duration: 5000,
      });

      // Update status
      setVerificationStatus('pending');

      // Call completion handler
      if (onComplete) {
        onComplete();
      }

      // Redirect to verification status page
      router.push(\`/verification/status/\${data.verificationId}\`);
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Verification Failed',
        description: 'There was an error submitting your verification request.',
        variant: 'destructive',
        duration: 5000,
      });
      setVerificationStatus('rejected');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className={className}>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center"
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border',
                  index === currentStep && 'border-primary bg-primary text-primary-foreground',
                  index < currentStep && 'border-primary bg-primary/20',
                  index > currentStep && 'border-muted bg-muted'
                )}
              >
                {index < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-16 bg-muted',
                    index < currentStep && 'bg-primary'
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'w-24 text-center text-sm',
                index === currentStep && 'text-primary font-medium',
                index !== currentStep && 'text-muted-foreground'
              )}
            >
              {step.title}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>
                {steps[currentStep].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {steps[currentStep].component}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0 || isSubmitting}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : currentStep === steps.length - 1 ? (
                  'Submit'
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Verification Status */}
      {verificationStatus !== 'pending' && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {verificationStatus === 'processing' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
                    Processing Verification
                  </>
                ) : verificationStatus === 'approved' ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    Verification Approved
                  </>
                ) : (
                  <>
                    <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                    Verification Failed
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {verificationStatus === 'processing'
                  ? 'Your verification request is being processed...'
                  : verificationStatus === 'approved'
                  ? 'Your account has been successfully verified!'
                  : 'There was an error processing your verification.'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
}