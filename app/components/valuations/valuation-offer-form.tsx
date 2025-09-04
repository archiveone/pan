'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  value: z.string()
    .min(1, 'Value is required')
    .transform(Number)
    .refine((val) => val > 0, {
      message: 'Value must be greater than 0',
    }),
  confidence: z.string()
    .transform(Number)
    .refine((val) => val >= 1 && val <= 5, {
      message: 'Confidence must be between 1 and 5',
    }),
  notes: z.string().min(1, 'Please provide some notes about your valuation'),
});

interface ValuationOfferFormProps {
  requestId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ValuationOfferForm = ({
  requestId,
  onSuccess,
  onCancel
}: ValuationOfferFormProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
      confidence: '3',
      notes: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      // Submit valuation offer
      await axios.post('/api/valuations/offer', {
        requestId,
        ...values,
      });
      
      toast({
        title: "Success!",
        description: "Your valuation has been submitted to the property owner.",
      });
      
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error('Valuation offer error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not submit valuation. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Value (£)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter estimated value" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Enter your professional valuation of the property
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confidence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confidence Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select confidence level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 - Low confidence</SelectItem>
                  <SelectItem value="2">2 - Moderate confidence</SelectItem>
                  <SelectItem value="3">3 - Good confidence</SelectItem>
                  <SelectItem value="4">4 - High confidence</SelectItem>
                  <SelectItem value="5">5 - Very high confidence</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How confident are you in this valuation based on the information provided?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valuation Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Explain your valuation and any assumptions made..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include key factors that influenced your valuation
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Valuation'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};