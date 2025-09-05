'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone,
  MessageSquare,
  Mail,
  CreditCard,
  Calendar,
  Clock,
  Check,
  ChevronRight,
  AlertCircle,
  Image as ImageIcon,
  MapPin,
  Upload,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useListingCreation } from '@/contexts/listing-creation-context';
import { cn } from '@/lib/utils';

interface CommunicationOption {
  type: 'phone' | 'message' | 'email' | 'all';
  label: string;
  description: string;
  icon: any;
}

interface BookingOption {
  type: 'direct' | 'request' | 'quote';
  label: string;
  description: string;
  icon: any;
}

const communicationOptions: CommunicationOption[] = [
  {
    type: 'phone',
    label: 'Phone Only',
    description: 'Share phone number with clients',
    icon: Phone,
  },
  {
    type: 'message',
    label: 'In-App Messages',
    description: 'Chat through the platform',
    icon: MessageSquare,
  },
  {
    type: 'email',
    label: 'Email Only',
    description: 'Share email with clients',
    icon: Mail,
  },
  {
    type: 'all',
    label: 'All Methods',
    description: 'Allow all communication methods',
    icon: Check,
  },
];

const bookingOptions: BookingOption[] = [
  {
    type: 'direct',
    label: 'Direct Payment',
    description: 'Clients can book and pay instantly',
    icon: CreditCard,
  },
  {
    type: 'request',
    label: 'Booking Request',
    description: 'Review and approve bookings',
    icon: Calendar,
  },
  {
    type: 'quote',
    label: 'Quote Required',
    description: 'Provide custom quotes',
    icon: MessageSquare,
  },
];

export function ServiceCommunication() {
  const { state, updateData, nextStep } = useListingCreation();
  const [title, setTitle] = useState(state.data.service?.title || '');
  const [description, setDescription] = useState(state.data.service?.description || '');
  const [address, setAddress] = useState(state.data.service?.address || '');
  const [photos, setPhotos] = useState<string[]>(state.data.service?.photos || []);
  const [communicationType, setCommunicationType] = useState(
    state.data.service?.communication?.type || 'message'
  );
  const [phoneNumber, setPhoneNumber] = useState(
    state.data.service?.communication?.phone || ''
  );
  const [email, setEmail] = useState(
    state.data.service?.communication?.email || ''
  );
  const [bookingType, setBookingType] = useState(
    state.data.service?.booking?.type || 'request'
  );
  const [responseTime, setResponseTime] = useState(
    state.data.service?.booking?.responseTime || 24
  );
  const [depositRequired, setDepositRequired] = useState(
    state.data.service?.booking?.depositRequired || false
  );
  const [depositPercentage, setDepositPercentage] = useState(
    state.data.service?.booking?.depositPercentage || 20
  );
  const [error, setError] = useState('');

  const validateCommunication = () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return false;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return false;
    }

    if (!address.trim()) {
      setError('Please enter an address');
      return false;
    }

    if (photos.length === 0) {
      setError('Please add at least one photo');
      return false;
    }

    if ((communicationType === 'phone' || communicationType === 'all') && !phoneNumber) {
      setError('Please enter a phone number');
      return false;
    }

    if ((communicationType === 'email' || communicationType === 'all') && !email) {
      setError('Please enter an email');
      return false;
    }

    if (bookingType === 'request' && responseTime < 1) {
      setError('Response time must be at least 1 hour');
      return false;
    }

    if (depositRequired && (depositPercentage < 1 || depositPercentage > 100)) {
      setError('Please set a valid deposit percentage');
      return false;
    }

    setError('');
    return true;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real implementation, you would upload these to your storage
      // For now, we'll just create URLs for preview
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (validateCommunication()) {
      updateData({
        service: {
          ...state.data.service,
          title,
          description,
          address,
          photos,
          communication: {
            type: communicationType,
            phone: phoneNumber,
            email,
          },
          booking: {
            type: bookingType,
            responseTime: bookingType === 'request' ? responseTime : undefined,
            depositRequired,
            depositPercentage: depositRequired ? depositPercentage : undefined,
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
          Service Details & Communication
        </h2>
        <p className="text-muted-foreground">
          Set up your service details and how clients can reach you
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Details */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Label>Service Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Professional Plumbing Services"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your service in detail..."
                className="mt-2"
                rows={4}
              />
            </div>

            <div>
              <Label>Address</Label>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your service location"
                />
              </div>
            </div>

            <div>
              <Label>Photos</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={photo}
                      alt={`Service photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <label className="border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Communication Preferences */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">Communication Methods</h3>
              <p className="text-sm text-muted-foreground">
                Choose how clients can contact you
              </p>
            </div>

            <RadioGroup
              value={communicationType}
              onValueChange={(value: any) => setCommunicationType(value)}
              className="grid gap-4"
            >
              {communicationOptions.map((option) => (
                <div
                  key={option.type}
                  className={cn(
                    "flex items-center space-x-4 p-4 border rounded-lg cursor-pointer",
                    communicationType === option.type && "border-primary bg-primary/5"
                  )}
                  onClick={() => setCommunicationType(option.type)}
                >
                  <div className={cn(
                    "p-2 rounded-full",
                    communicationType === option.type ? "bg-primary text-white" : "bg-muted"
                  )}>
                    <option.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{option.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>

            <AnimatePresence>
              {(communicationType === 'phone' || communicationType === 'all') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="grid gap-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1234567890"
                    />
                  </div>
                </motion.div>
              )}

              {(communicationType === 'email' || communicationType === 'all') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="grid gap-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Booking Options */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">Booking Method</h3>
              <p className="text-sm text-muted-foreground">
                Choose how clients can book your service
              </p>
            </div>

            <RadioGroup
              value={bookingType}
              onValueChange={(value: any) => setBookingType(value)}
              className="grid gap-4"
            >
              {bookingOptions.map((option) => (
                <div
                  key={option.type}
                  className={cn(
                    "flex items-center space-x-4 p-4 border rounded-lg cursor-pointer",
                    bookingType === option.type && "border-primary bg-primary/5"
                  )}
                  onClick={() => setBookingType(option.type)}
                >
                  <div className={cn(
                    "p-2 rounded-full",
                    bookingType === option.type ? "bg-primary text-white" : "bg-muted"
                  )}>
                    <option.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{option.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>

            <AnimatePresence>
              {bookingType === 'request' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
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
                </motion.div>
              )}

              {bookingType === 'direct' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Deposit</Label>
                      <p className="text-sm text-muted-foreground">
                        Clients must pay a deposit to book
                      </p>
                    </div>
                    <Switch
                      checked={depositRequired}
                      onCheckedChange={setDepositRequired}
                    />
                  </div>

                  {depositRequired && (
                    <div className="grid gap-2">
                      <Label>Deposit Percentage</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={depositPercentage}
                          onChange={(e) => setDepositPercentage(Number(e.target.value))}
                          min={1}
                          max={100}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </div>
                  )}
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