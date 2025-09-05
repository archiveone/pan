'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Euro,
  Users,
  Clock,
  Plus,
  Minus,
  Check,
  ChevronRight,
  X,
  Calendar,
  AlertCircle,
  Percent,
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
import { cn, formatPrice } from '@/lib/utils';

type PricingType = 'per-person' | 'per-group' | 'per-session';
type CancellationPolicy = 'flexible' | 'moderate' | 'strict';

interface CancellationPolicyOption {
  type: CancellationPolicy;
  label: string;
  description: string;
  refundPercentage: number;
  cutoffHours: number;
}

const cancellationPolicies: CancellationPolicyOption[] = [
  {
    type: 'flexible',
    label: 'Flexible',
    description: 'Full refund up to 24 hours before start time',
    refundPercentage: 100,
    cutoffHours: 24,
  },
  {
    type: 'moderate',
    label: 'Moderate',
    description: '50% refund up to 48 hours before start time',
    refundPercentage: 50,
    cutoffHours: 48,
  },
  {
    type: 'strict',
    label: 'Strict',
    description: 'No refunds within 72 hours of start time',
    refundPercentage: 0,
    cutoffHours: 72,
  },
];

export function LeisurePricing() {
  const { state, updateData, nextStep } = useListingCreation();
  const [pricingType, setPricingType] = useState<PricingType>(
    state.data.leisure?.pricing?.type || 'per-person'
  );
  const [basePrice, setBasePrice] = useState(
    state.data.leisure?.pricing?.basePrice || 0
  );
  const [minParticipants, setMinParticipants] = useState(
    state.data.leisure?.pricing?.minParticipants || 1
  );
  const [maxParticipants, setMaxParticipants] = useState(
    state.data.leisure?.pricing?.maxParticipants || 1
  );
  const [groupDiscount, setGroupDiscount] = useState(
    state.data.leisure?.pricing?.groupDiscount || false
  );
  const [discountThreshold, setDiscountThreshold] = useState(
    state.data.leisure?.pricing?.discountThreshold || 5
  );
  const [discountPercentage, setDiscountPercentage] = useState(
    state.data.leisure?.pricing?.discountPercentage || 10
  );
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy>(
    state.data.leisure?.cancellation?.policy || 'flexible'
  );
  const [customRefundPercentage, setCustomRefundPercentage] = useState(
    state.data.leisure?.cancellation?.customRefundPercentage || 100
  );
  const [customCutoffHours, setCustomCutoffHours] = useState(
    state.data.leisure?.cancellation?.customCutoffHours || 24
  );
  const [error, setError] = useState('');

  const validatePricing = () => {
    if (basePrice <= 0) {
      setError('Please set a valid base price');
      return false;
    }

    if (pricingType === 'per-person') {
      if (minParticipants < 1 || maxParticipants < minParticipants) {
        setError('Please set valid participant limits');
        return false;
      }
    }

    if (groupDiscount) {
      if (discountThreshold <= 0 || discountPercentage <= 0 || discountPercentage > 100) {
        setError('Please set valid group discount parameters');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleContinue = () => {
    if (validatePricing()) {
      updateData({
        leisure: {
          ...state.data.leisure,
          pricing: {
            type: pricingType,
            basePrice,
            minParticipants: pricingType === 'per-person' ? minParticipants : undefined,
            maxParticipants: pricingType === 'per-person' ? maxParticipants : undefined,
            groupDiscount,
            discountThreshold: groupDiscount ? discountThreshold : undefined,
            discountPercentage: groupDiscount ? discountPercentage : undefined,
          },
          cancellation: {
            policy: cancellationPolicy,
            customRefundPercentage: cancellationPolicy === 'custom' ? customRefundPercentage : undefined,
            customCutoffHours: cancellationPolicy === 'custom' ? customCutoffHours : undefined,
          },
        },
      });
      nextStep();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          Set Your Pricing
        </h2>
        <p className="text-muted-foreground">
          Choose how you want to price your leisure offering
        </p>
      </div>

      <div className="space-y-8">
        {/* Pricing Type Selection */}
        <Card className="p-6">
          <RadioGroup
            value={pricingType}
            onValueChange={(value: PricingType) => setPricingType(value)}
            className="grid gap-4"
          >
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="per-person" id="per-person" />
              <Label htmlFor="per-person" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Per Person
              </Label>
            </div>
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="per-group" id="per-group" />
              <Label htmlFor="per-group" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Per Group
              </Label>
            </div>
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="per-session" id="per-session" />
              <Label htmlFor="per-session" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Per Session
              </Label>
            </div>
          </RadioGroup>
        </Card>

        {/* Base Price */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="grid gap-2">
              <Label>Base Price</Label>
              <div className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-muted-foreground" />
                <Input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-32"
                  min={0}
                />
                <span className="text-muted-foreground">
                  {pricingType === 'per-person' ? 'per person' :
                   pricingType === 'per-group' ? 'per group' :
                   'per session'}
                </span>
              </div>
            </div>

            {pricingType === 'per-person' && (
              <div className="space-y-4">
                <Label>Participant Limits</Label>
                <div className="flex items-center gap-8">
                  <div className="space-y-2">
                    <Label>Minimum</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setMinParticipants(prev => Math.max(1, prev - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={minParticipants}
                        onChange={(e) => setMinParticipants(Number(e.target.value))}
                        className="w-20 text-center"
                        min={1}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setMinParticipants(prev => prev + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setMaxParticipants(prev => Math.max(minParticipants, prev - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(Number(e.target.value))}
                        className="w-20 text-center"
                        min={minParticipants}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setMaxParticipants(prev => prev + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Group Discount</Label>
                  <p className="text-sm text-muted-foreground">
                    Offer discounts for larger groups
                  </p>
                </div>
                <Switch
                  checked={groupDiscount}
                  onCheckedChange={setGroupDiscount}
                />
              </div>

              <AnimatePresence>
                {groupDiscount && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid gap-2">
                      <Label>Discount Threshold (participants)</Label>
                      <Input
                        type="number"
                        value={discountThreshold}
                        onChange={(e) => setDiscountThreshold(Number(e.target.value))}
                        min={2}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Discount Percentage</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={discountPercentage}
                          onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                          min={0}
                          max={100}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>

        {/* Cancellation Policy */}
        <Card className="p-6">
          <div className="space-y-6">
            <h3 className="font-semibold">Cancellation Policy</h3>
            <RadioGroup
              value={cancellationPolicy}
              onValueChange={(value: CancellationPolicy) => setCancellationPolicy(value)}
              className="grid gap-4"
            >
              {cancellationPolicies.map((policy) => (
                <div
                  key={policy.type}
                  className={cn(
                    "flex items-center space-x-4 p-4 border rounded-lg",
                    cancellationPolicy === policy.type && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value={policy.type} id={policy.type} />
                  <div className="flex-1">
                    <Label htmlFor={policy.type} className="font-medium">
                      {policy.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {policy.description}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">{policy.refundPercentage}% refund</div>
                    <div className="text-muted-foreground">
                      {policy.cutoffHours}h notice
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
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