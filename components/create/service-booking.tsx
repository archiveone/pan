'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Clock,
  Shield,
  MessageSquare,
  Check,
  ChevronRight,
  AlertCircle,
  FileText,
  Building,
  Euro,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useListingCreation } from '@/contexts/listing-creation-context';
import { cn } from '@/lib/utils';

type BookingType = 'instant' | 'request' | 'quote';
type InsuranceType = 'professional' | 'liability' | 'equipment' | 'none';

interface InsuranceOption {
  type: InsuranceType;
  label: string;
  description: string;
  icon: any;
  providers: string[];
}

const insuranceOptions: InsuranceOption[] = [
  {
    type: 'professional',
    label: 'Professional Indemnity',
    description: 'Covers professional advice and service',
    icon: Shield,
    providers: ['AXA', 'Allianz', 'Zurich'],
  },
  {
    type: 'liability',
    label: 'Public Liability',
    description: 'Covers third-party injury or property damage',
    icon: Building,
    providers: ['AXA', 'Allianz', 'Zurich'],
  },
  {
    type: 'equipment',
    label: 'Equipment Insurance',
    description: 'Covers tools and equipment',
    icon: FileText,
    providers: ['AXA', 'Allianz', 'Zurich'],
  },
];

export function ServiceBooking() {
  const { state, updateData, nextStep } = useListingCreation();
  const [bookingType, setBookingType] = useState<BookingType>(
    state.data.service?.bookingType || 'request'
  );
  const [requiresQuote, setRequiresQuote] = useState(false);
  const [responseTime, setResponseTime] = useState(24);
  const [insuranceType, setInsuranceType] = useState<InsuranceType>(
    state.data.service?.insurance?.type || 'none'
  );
  const [insuranceProvider, setInsuranceProvider] = useState(
    state.data.service?.insurance?.provider || ''
  );
  const [insuranceCoverage, setInsuranceCoverage] = useState(
    state.data.service?.insurance?.coverage || 0
  );
  const [error, setError] = useState('');

  const validateBooking = () => {
    if (bookingType === 'request' && responseTime < 1) {
      setError('Response time must be at least 1 hour');
      return false;
    }

    if (insuranceType !== 'none') {
      if (!insuranceProvider) {
        setError('Please select an insurance provider');
        return false;
      }
      if (insuranceCoverage <= 0) {
        setError('Please enter valid insurance coverage');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleContinue = () => {
    if (validateBooking()) {
      updateData({
        service: {
          ...state.data.service,
          bookingType,
          requiresQuote,
          responseTime: bookingType === 'request' ? responseTime : undefined,
          insurance: insuranceType !== 'none' ? {
            type: insuranceType,
            provider: insuranceProvider,
            coverage: insuranceCoverage,
          } : undefined,
        },
      });
      nextStep();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          Booking Settings
        </h2>
        <p className="text-muted-foreground">
          Choose how clients can book your service
        </p>
      </div>

      <div className="space-y-8">
        {/* Booking Type Selection */}
        <Card className="p-6">
          <RadioGroup
            value={bookingType}
            onValueChange={(value: BookingType) => setBookingType(value)}
            className="grid gap-4"
          >
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="instant" id="instant" />
              <Label htmlFor="instant" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Instant Booking
                <span className="text-sm text-muted-foreground ml-2">
                  (Clients can book immediately)
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="request" id="request" />
              <Label htmlFor="request" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Booking Request
                <span className="text-sm text-muted-foreground ml-2">
                  (Review and approve requests)
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="quote" id="quote" />
              <Label htmlFor="quote" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Quote Required
                <span className="text-sm text-muted-foreground ml-2">
                  (Discuss details before booking)
                </span>
              </Label>
            </div>
          </RadioGroup>
        </Card>

        {/* Booking Settings */}
        <AnimatePresence>
          {bookingType === 'request' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="grid gap-2">
                    <Label>Response Time (hours)</Label>
                    <Input
                      type="number"
                      value={responseTime}
                      onChange={(e) => setResponseTime(Number(e.target.value))}
                      min={1}
                      max={72}
                    />
                    <p className="text-sm text-muted-foreground">
                      How quickly you'll respond to booking requests
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Insurance Selection */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Insurance Coverage</h3>
              <p className="text-sm text-muted-foreground">
                Select your insurance type and coverage
              </p>
            </div>

            <RadioGroup
              value={insuranceType}
              onValueChange={(value: InsuranceType) => {
                setInsuranceType(value);
                setInsuranceProvider('');
                setInsuranceCoverage(0);
              }}
              className="grid gap-4"
            >
              {insuranceOptions.map((option) => (
                <div key={option.type} className="flex items-center space-x-4">
                  <RadioGroupItem value={option.type} id={option.type} />
                  <Label htmlFor={option.type} className="flex items-center gap-2">
                    <option.icon className="w-4 h-4" />
                    {option.label}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({option.description})
                    </span>
                  </Label>
                </div>
              ))}
              <div className="flex items-center space-x-4">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none">No insurance needed</Label>
              </div>
            </RadioGroup>

            <AnimatePresence>
              {insuranceType !== 'none' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="grid gap-2">
                    <Label>Insurance Provider</Label>
                    <Select
                      value={insuranceProvider}
                      onValueChange={setInsuranceProvider}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {insuranceOptions
                          .find(opt => opt.type === insuranceType)
                          ?.providers.map(provider => (
                            <SelectItem key={provider} value={provider}>
                              {provider}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Coverage Amount</Label>
                    <div className="flex items-center gap-2">
                      <Euro className="w-5 h-5 text-muted-foreground" />
                      <Input
                        type="number"
                        value={insuranceCoverage}
                        onChange={(e) => setInsuranceCoverage(Number(e.target.value))}
                        min={0}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-destructive text-sm text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            className="bg-green-500 hover:bg-green-600"
          >
            <Check className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}