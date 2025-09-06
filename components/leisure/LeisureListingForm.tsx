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
import { LeisureQuotaAlert } from './LeisureQuotaAlert';
import { Loader2 } from 'lucide-react';
import { DateTimePicker } from '@/components/ui/date-time-picker';

const leisureFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['RENTAL', 'EXPERIENCE', 'EVENT']),
  price: z.number().min(0, 'Price must be a positive number'),
  location: z.string().min(3, 'Location is required'),
  availability: z.array(z.date()).min(1, 'At least one availability slot is required'),
});

type LeisureFormData = z.infer<typeof leisureFormSchema>;

interface LeisureListingFormProps {
  initialData?: Partial<LeisureFormData>;
  mode?: 'create' | 'edit';
  leisureId?: string;
  quotaInfo?: {
    used: number;
    limit: number;
    isPro: boolean;
  };
}

export function LeisureListingForm({
  initialData,
  mode = 'create',
  leisureId,
  quotaInfo,
}: LeisureListingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LeisureFormData>({
    resolver: zodResolver(leisureFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      type: initialData?.type || 'RENTAL',
      price: initialData?.price || 0,
      location: initialData?.location || '',
      availability: initialData?.availability || [],
    },
  });

  const onSubmit = async (data: LeisureFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/leisure', {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(mode === 'edit' && { id: leisureId }),
          ...data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error === 'Monthly leisure listing quota exceeded') {
          toast({
            title: 'Quota Exceeded',
            description: 'Upgrade to PRO for unlimited leisure listings.',
            variant: 'destructive',
          });
          return;
        }
        throw new Error('Failed to save leisure listing');
      }

      toast({
        title: 'Success',
        description: `Leisure listing ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      });

      router.push('/leisure/my-listings');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAvailability = (date: Date) => {
    const currentAvailability = form.getValues('availability');
    form.setValue('availability', [...currentAvailability, date]);
  };

  const removeAvailability = (index: number) => {
    const currentAvailability = form.getValues('availability');
    form.setValue(
      'availability',
      currentAvailability.filter((_, i) => i !== index)
    );
  };

  return (
    <>
      {quotaInfo && mode === 'create' && (
        <LeisureQuotaAlert
          quotaUsed={quotaInfo.used}
          quotaLimit={quotaInfo.limit}
          isPro={quotaInfo.isPro}
        />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter leisure title" {...field} />
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
                    placeholder="Describe your leisure offering"
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="RENTAL">Rental</SelectItem>
                    <SelectItem value="EXPERIENCE">Experience</SelectItem>
                    <SelectItem value="EVENT">Event</SelectItem>
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
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Availability</FormLabel>
                <div className="space-y-4">
                  <DateTimePicker
                    onSelect={(date) => date && addAvailability(date)}
                  />
                  <div className="mt-2 space-y-2">
                    {field.value.map((date, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <span>
                          {new Date(date).toLocaleString()}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAvailability(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </div>
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
              {mode === 'create' ? 'Create Listing' : 'Update Listing'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}