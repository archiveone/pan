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
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  proposedCommission: z.string()
    .min(1, 'Commission rate is required')
    .transform(Number)
    .refine((val) => val >= 0 && val <= 100, {
      message: 'Commission must be between 0 and 100',
    }),
  message: z.string().min(1, 'Message is required'),
});

interface AgentInterestFormProps {
  privateListingId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AgentInterestForm = ({
  privateListingId,
  onSuccess,
  onCancel
}: AgentInterestFormProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proposedCommission: '',
      message: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      // Submit agent interest
      await axios.post('/api/private-marketplace/interest', {
        privateListingId,
        ...values,
      });
      
      toast({
        title: "Success!",
        description: "Your interest has been submitted to the property owner.",
      });
      
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error('Agent interest submission error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not submit interest. Please try again.",
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
          name="proposedCommission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposed Commission Rate (%)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1"
                  placeholder="Enter commission rate" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Enter your proposed commission rate as a percentage
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message to Property Owner</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Introduce yourself and explain why you're the best agent for this property..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include your experience and success rate in similar properties
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
              'Express Interest'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};