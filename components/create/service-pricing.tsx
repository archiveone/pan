'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Euro,
  Clock,
  Package,
  Plus,
  Minus,
  Check,
  ChevronRight,
  X,
  Trash2,
  Edit2,
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

interface Package {
  name: string;
  description: string;
  price: number;
  duration?: string;
}

type PaymentType = 'fixed' | 'hourly' | 'project' | 'subscription';

export function ServicePricing() {
  const { state, updateData, nextStep } = useListingCreation();
  const [paymentType, setPaymentType] = useState<PaymentType>(
    state.data.service?.pricing?.type || 'hourly'
  );
  const [rate, setRate] = useState(
    state.data.service?.pricing?.rate || 0
  );
  const [minimumHours, setMinimumHours] = useState(
    state.data.service?.pricing?.minimumHours || 1
  );
  const [packages, setPackages] = useState<Package[]>(
    state.data.service?.pricing?.packages || []
  );
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<number | null>(null);
  const [newPackage, setNewPackage] = useState<Package>({
    name: '',
    description: '',
    price: 0,
    duration: '',
  });
  const [error, setError] = useState('');

  const validatePricing = () => {
    if (rate <= 0) {
      setError('Please set a valid rate');
      return false;
    }

    if (paymentType === 'hourly' && minimumHours < 1) {
      setError('Minimum hours must be at least 1');
      return false;
    }

    setError('');
    return true;
  };

  const handleAddPackage = () => {
    if (!newPackage.name || !newPackage.description || newPackage.price <= 0) {
      setError('Please fill in all package details');
      return;
    }

    if (editingPackage !== null) {
      setPackages(prev => prev.map((p, i) => 
        i === editingPackage ? newPackage : p
      ));
      setEditingPackage(null);
    } else {
      setPackages(prev => [...prev, newPackage]);
    }

    setNewPackage({
      name: '',
      description: '',
      price: 0,
      duration: '',
    });
    setShowPackageForm(false);
    setError('');
  };

  const handleEditPackage = (index: number) => {
    setNewPackage(packages[index]);
    setEditingPackage(index);
    setShowPackageForm(true);
  };

  const handleDeletePackage = (index: number) => {
    setPackages(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (validatePricing()) {
      updateData({
        service: {
          ...state.data.service,
          pricing: {
            type: paymentType,
            rate,
            minimumHours: paymentType === 'hourly' ? minimumHours : undefined,
            packages: packages.length > 0 ? packages : undefined,
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
          Choose how you want to charge for your service
        </p>
      </div>

      <div className="space-y-8">
        {/* Payment Type Selection */}
        <Card className="p-6">
          <RadioGroup
            value={paymentType}
            onValueChange={(value: PaymentType) => setPaymentType(value)}
            className="grid gap-4"
          >
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="hourly" id="hourly" />
              <Label htmlFor="hourly" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Hourly Rate
              </Label>
            </div>
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="fixed" id="fixed" />
              <Label htmlFor="fixed" className="flex items-center gap-2">
                <Euro className="w-4 h-4" />
                Fixed Price
              </Label>
            </div>
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="project" id="project" />
              <Label htmlFor="project" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Project-based
              </Label>
            </div>
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="subscription" id="subscription" />
              <Label htmlFor="subscription" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Subscription
              </Label>
            </div>
          </RadioGroup>
        </Card>

        {/* Rate Setting */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="grid gap-2">
              <Label>
                {paymentType === 'hourly' ? 'Hourly Rate' :
                 paymentType === 'subscription' ? 'Monthly Rate' :
                 'Base Rate'}
              </Label>
              <div className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-muted-foreground" />
                <Input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-32"
                  min={0}
                />
                <span className="text-muted-foreground">
                  {paymentType === 'hourly' ? 'per hour' :
                   paymentType === 'subscription' ? 'per month' :
                   ''}
                </span>
              </div>
            </div>

            {paymentType === 'hourly' && (
              <div className="grid gap-2">
                <Label>Minimum Hours</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMinimumHours(prev => Math.max(1, prev - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={minimumHours}
                    onChange={(e) => setMinimumHours(Number(e.target.value))}
                    className="w-20 text-center"
                    min={1}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMinimumHours(prev => prev + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Service Packages */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Service Packages</h3>
                <p className="text-sm text-muted-foreground">
                  Create pre-defined service packages
                </p>
              </div>
              <Button
                onClick={() => setShowPackageForm(true)}
                disabled={showPackageForm}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Package
              </Button>
            </div>

            <AnimatePresence>
              {showPackageForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 border rounded-lg p-4"
                >
                  <div className="grid gap-4">
                    <div>
                      <Label>Package Name</Label>
                      <Input
                        value={newPackage.name}
                        onChange={(e) => setNewPackage(prev => ({
                          ...prev,
                          name: e.target.value,
                        }))}
                        placeholder="e.g., Basic Package"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newPackage.description}
                        onChange={(e) => setNewPackage(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))}
                        placeholder="What's included in this package?"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Price</Label>
                        <div className="flex items-center gap-2">
                          <Euro className="w-5 h-5 text-muted-foreground" />
                          <Input
                            type="number"
                            value={newPackage.price}
                            onChange={(e) => setNewPackage(prev => ({
                              ...prev,
                              price: Number(e.target.value),
                            }))}
                            min={0}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Duration (optional)</Label>
                        <Input
                          value={newPackage.duration}
                          onChange={(e) => setNewPackage(prev => ({
                            ...prev,
                            duration: e.target.value,
                          }))}
                          placeholder="e.g., 2 hours"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPackageForm(false);
                        setEditingPackage(null);
                        setNewPackage({
                          name: '',
                          description: '',
                          price: 0,
                          duration: '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddPackage}>
                      {editingPackage !== null ? 'Update' : 'Add'} Package
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid gap-4">
              {packages.map((pkg, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{pkg.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {pkg.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-primary font-semibold">
                          €{formatPrice(pkg.price, false)}
                        </span>
                        {pkg.duration && (
                          <span className="text-sm text-muted-foreground">
                            {pkg.duration}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditPackage(index)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePackage(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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