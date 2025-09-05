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
  Building2,
  Briefcase,
  FileText,
  Calendar,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AGENT_VERIFICATION_LEVELS,
  AgentLicense,
  AgencyVerification,
  InsuranceDetails,
} from '@/lib/verification/AgentVerificationService';

interface AgentVerificationFormProps {
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

export function AgentVerificationForm({
  userId,
  currentLevel = 0,
  onComplete,
  className,
}: AgentVerificationFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<
    'pending' | 'processing' | 'approved' | 'rejected'
  >('pending');

  // Form state
  const [license, setLicense] = useState<Partial<AgentLicense>>({});
  const [agency, setAgency] = useState<Partial<AgencyVerification>>({});
  const [insurance, setInsurance] = useState<Partial<InsuranceDetails>>({});

  const steps: VerificationStep[] = [
    {
      id: 'basic-verification',
      title: 'Basic Verification',
      description: 'Complete basic identity verification first',
      component: (
        <div className="space-y-4">
          <div className="rounded-lg border p-4 bg-yellow-50">
            <AlertCircle className="h-5 w-5 text-yellow-600 mb-2" />
            <p className="text-sm text-yellow-800">
              You must complete basic identity verification before proceeding with agent verification.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/verification')}
            >
              Complete Basic Verification
            </Button>
          </div>
        </div>
      ),
      required: true,
    },
    {
      id: 'license-verification',
      title: 'License Details',
      description: 'Enter your real estate license information',
      component: (
        <div className="space-y-6">
          <FormField
            name="licenseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Type</FormLabel>
                <Select
                  onValueChange={(value) => setLicense({ ...license, type: value })}
                  value={license.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select license type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real_estate_agent">Real Estate Agent</SelectItem>
                    <SelectItem value="broker">Broker</SelectItem>
                    <SelectItem value="property_manager">Property Manager</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="licenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter license number"
                    onChange={(e) => setLicense({ ...license, number: e.target.value })}
                    value={license.number}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="issueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {license.issueDate ? (
                          format(new Date(license.issueDate), 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={license.issueDate ? new Date(license.issueDate) : undefined}
                        onSelect={(date) => setLicense({ ...license, issueDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {license.expiryDate ? (
                          format(new Date(license.expiryDate), 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={license.expiryDate ? new Date(license.expiryDate) : undefined}
                        onSelect={(date) => setLicense({ ...license, expiryDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Upload License Document</Label>
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Upload a clear copy of your license
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF or image format (max 5MB)
              </p>
            </div>
          </div>
        </div>
      ),
      required: true,
    },
    {
      id: 'agency-details',
      title: 'Agency Information',
      description: 'Enter your agency or brokerage details',
      component: (
        <div className="space-y-6">
          <FormField
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter company name"
                    onChange={(e) => setAgency({ ...agency, companyName: e.target.value })}
                    value={agency.companyName}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="registrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Registration Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter registration number"
                    onChange={(e) => setAgency({ ...agency, registrationNumber: e.target.value })}
                    value={agency.registrationNumber}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="vatNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>VAT Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter VAT number"
                    onChange={(e) => setAgency({ ...agency, vatNumber: e.target.value })}
                    value={agency.vatNumber}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label>Company Documents</Label>
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Upload company registration documents
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF format preferred (max 10MB)
              </p>
            </div>
          </div>
        </div>
      ),
      required: true,
    },
    {
      id: 'insurance-details',
      title: 'Insurance Information',
      description: 'Provide your professional insurance details',
      component: (
        <div className="space-y-6">
          <FormField
            name="insuranceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Type</FormLabel>
                <Select
                  onValueChange={(value) => setInsurance({ ...insurance, type: value as any })}
                  value={insurance.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select insurance type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional_indemnity">Professional Indemnity</SelectItem>
                    <SelectItem value="public_liability">Public Liability</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="coverageAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coverage Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter amount"
                      onChange={(e) => setInsurance({ ...insurance, coverageAmount: Number(e.target.value) })}
                      value={insurance.coverageAmount}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={(value) => setInsurance({ ...insurance, currency: value })}
                    value={insurance.currency}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {insurance.startDate ? (
                          format(new Date(insurance.startDate), 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={insurance.startDate ? new Date(insurance.startDate) : undefined}
                        onSelect={(date) => setInsurance({ ...insurance, startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {insurance.expiryDate ? (
                          format(new Date(insurance.expiryDate), 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={insurance.expiryDate ? new Date(insurance.expiryDate) : undefined}
                        onSelect={(date) => setInsurance({ ...insurance, expiryDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Insurance Certificate</Label>
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Upload your insurance certificate
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF format required (max 5MB)
              </p>
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

      // Validate all required fields
      if (!license.type || !license.number || !license.issueDate || !license.expiryDate) {
        throw new Error('Please complete all license details');
      }

      if (!agency.companyName || !agency.registrationNumber) {
        throw new Error('Please complete all agency details');
      }

      if (!insurance.type || !insurance.coverageAmount || !insurance.currency ||
          !insurance.startDate || !insurance.expiryDate) {
        throw new Error('Please complete all insurance details');
      }

      // Call agent verification service
      const response = await fetch('/api/verification/agent/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          level: AGENT_VERIFICATION_LEVELS[0].level,
          license,
          agency,
          insurance,
        }),
      });

      if (!response.ok) {
        throw new Error('Agent verification request failed');
      }

      const data = await response.json();

      // Show success message
      toast({
        title: 'Verification Submitted',
        description: 'Your agent verification request has been submitted successfully.',
        duration: 5000,
      });

      // Update status
      setVerificationStatus('pending');

      // Call completion handler
      if (onComplete) {
        onComplete();
      }

      // Redirect to verification status page
      router.push(\`/verification/agent/status/\${data.verificationId}\`);
    } catch (error) {
      console.error('Agent verification error:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'There was an error submitting your verification request.',
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
                  ? 'Your agent verification request is being processed...'
                  : verificationStatus === 'approved'
                  ? 'Your agent account has been successfully verified!'
                  : 'There was an error processing your verification.'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
}