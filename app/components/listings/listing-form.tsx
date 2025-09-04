'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ImageUpload } from '@/components/ui/image-upload';
import { useToast } from '@/components/ui/use-toast';

// Base schema for common fields
const baseSchema = {
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  location: z.string().min(1, 'Location is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  availability: z.string(),
  tags: z.array(z.string()),
};

// Property specific schema
const propertySchema = z.object({
  ...baseSchema,
  category: z.literal('PROPERTY'),
  propertyType: z.string(),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  size: z.number().min(0),
  features: z.array(z.string()),
  amenities: z.array(z.string()),
  floorPlan: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  listingType: z.enum(['SALE', 'RENT', 'AUCTION']),
  availableFrom: z.date(),
  minimumTerm: z.number().optional(),
  maximumTerm: z.number().optional(),
  deposit: z.number().optional(),
  furnished: z.boolean().optional(),
  petsAllowed: z.boolean().optional(),
  parkingAvailable: z.boolean().optional(),
  epcRating: z.string().optional(),
  councilTax: z.string().optional(),
  propertyTenure: z.enum(['FREEHOLD', 'LEASEHOLD']).optional(),
  leaseYearsRemaining: z.number().optional(),
  groundRent: z.number().optional(),
  serviceFee: z.number().optional(),
});

// Service specific schema
const serviceSchema = z.object({
  ...baseSchema,
  category: z.literal('SERVICE'),
  serviceType: z.string(),
  expertise: z.array(z.string()),
  qualifications: z.array(z.string()),
  insurance: z.string(),
  serviceAreas: z.array(z.string()),
  availability: z.object({
    days: z.array(z.string()),
    hours: z.object({
      start: z.string(),
      end: z.string(),
    }),
  }),
  pricing: z.object({
    type: z.enum(['HOURLY', 'FIXED', 'QUOTE']),
    rate: z.number().optional(),
  }),
  minimumBooking: z.number(),
  cancellationPolicy: z.string(),
});

// Leisure specific schema
const leisureSchema = z.object({
  ...baseSchema,
  category: z.literal('LEISURE'),
  leisureType: z.enum(['RENTAL', 'EXPERIENCE', 'VENUE']),
  capacity: z.number().optional(),
  duration: z.number(),
  included: z.array(z.string()),
  requirements: z.array(z.string()).optional(),
  restrictions: z.array(z.string()).optional(),
  cancellationTerms: z.string(),
  bookingNotice: z.number(),
  seasonalPricing: z.record(z.string(), z.number()).optional(),
  availableSlots: z.array(z.object({
    date: z.date(),
    slots: z.array(z.string()),
  })).optional(),
});

// Combined schema
const listingSchema = z.discriminatedUnion('category', [
  propertySchema,
  serviceSchema,
  leisureSchema,
]);

type ListingFormValues = z.infer<typeof listingSchema>;

interface ListingFormProps {
  initialData?: ListingFormValues;
}

export const ListingForm = ({ initialData }: ListingFormProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: initialData || {
      category: 'PROPERTY',
      visibility: 'PUBLIC',
      images: [],
      tags: [],
    },
  });

  const category = form.watch('category');

  const onSubmit = async (data: ListingFormValues) => {
    try {
      setLoading(true);
      await axios.post('/api/listings', data);
      
      toast({
        title: 'Success',
        description: 'Listing created successfully',
      });
      
      router.push('/listings');
      router.refresh();
    } catch (error) {
      console.error('[LISTING_CREATE]', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Category Selection */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                disabled={loading}
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PROPERTY">Property</SelectItem>
                  <SelectItem value="SERVICE">Service</SelectItem>
                  <SelectItem value="LEISURE">Leisure</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Common Fields */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input disabled={loading} placeholder="Enter title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={loading}
                    placeholder="Enter description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="Enter price"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Enter location"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    disabled={loading}
                    onChange={(urls) => field.onChange(urls)}
                    onRemove={(url) =>
                      field.onChange(field.value.filter((current) => current !== url))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select
                  disabled={loading}
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category Specific Fields */}
        {category === 'PROPERTY' && (
          <div className="space-y-4">
            {/* Property specific fields */}
            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="HOUSE">House</SelectItem>
                      <SelectItem value="FLAT">Flat</SelectItem>
                      <SelectItem value="BUNGALOW">Bungalow</SelectItem>
                      <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add more property specific fields */}
          </div>
        )}

        {category === 'SERVICE' && (
          <div className="space-y-4">
            {/* Service specific fields */}
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TRADE">Trade</SelectItem>
                      <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                      <SelectItem value="SPECIALIST">Specialist</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add more service specific fields */}
          </div>
        )}

        {category === 'LEISURE' && (
          <div className="space-y-4">
            {/* Leisure specific fields */}
            <FormField
              control={form.control}
              name="leisureType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leisure Type</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leisure type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="RENTAL">Rental</SelectItem>
                      <SelectItem value="EXPERIENCE">Experience</SelectItem>
                      <SelectItem value="VENUE">Venue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add more leisure specific fields */}
          </div>
        )}

        <Button disabled={loading} type="submit">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update Listing' : 'Create Listing'}
        </Button>
      </form>
    </Form>
  );
};