import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
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
import { useToast } from '@/components/ui/use-toast';
import { ServicePaymentModal } from './ServicePaymentModal';
import { Loader2 } from 'lucide-react';

const serviceFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['TRADES', 'PROFESSIONAL', 'SPECIALIST', 'OTHER']),
  price: z.number().min(0, 'Price must be a positive number'),
  duration: z.string().optional(),
  location: z.string().min(3, 'Location is required'),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

interface ServiceListingFormProps {
  initialData?: Partial<ServiceFormData>;
  mode?: 'create' | 'edit';
  serviceId?: string;
}

export function ServiceListingForm({
  initialData,
  mode = 'create',
  serviceId,
}: ServiceListingFormProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || 'TRADES',
      price: initialData?.price || 0,
      duration: initialData?.duration || '',
      location: initialData?.location || '',
    },
  });

  const onSubmit = async (data: ServiceFormData) => {
    if (mode === 'create') {
      // Open payment modal for new listings
      setIsPaymentModalOpen(true);
    } else {
      // Direct update for existing listings
      await handleUpdate(data);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setIsPaymentModalOpen(false);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form.getValues(),
          paymentIntentId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create service');

      toast({
        title: 'Success',
        description: 'Your service listing has been created.',
      });

      router.push('/services/my-listings');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create service listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: ServiceFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/services`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: serviceId,
          ...data,
        }),
      });

      if (!response.ok) throw new Error('Failed to update service');

      toast({
        title: 'Success',
        description: 'Your service listing has been updated.',
      });

      router.push('/services/my-listings');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update service listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter service title" {...field} />
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
                    placeholder="Describe your service"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="TRADES">Trades</SelectItem>
                    <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                    <SelectItem value="SPECIALIST">Specialist</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
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
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2 hours, 1 day" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Service location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === 'create' ? 'Continue to Payment' : 'Update Service'}
            </Button>
          </div>
        </form>
      </Form>

      <ServicePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        mode="create"
      />
    </>
  );
}