'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Form validation schema
const inquirySchema = z.object({
  message: z.string()
    .min(50, 'Message must be at least 50 characters')
    .max(1000, 'Message cannot exceed 1000 characters'),
});

interface AgentInquiryFormProps {
  onSubmit: (message: string) => void;
  onCancel: () => void;
}

export default function AgentInquiryForm({ onSubmit, onCancel }: AgentInquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof inquirySchema>>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      message: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof inquirySchema>) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values.message);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      // Error will be handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit Property Inquiry</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Message to the Property Owner</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Introduce yourself and explain why you would be the best agent to represent this property. Include your experience, local market knowledge, and proposed strategy."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your message should be professional and highlight your qualifications.
                    Remember that GREIA takes a 5% commission from successful agent matches.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Inquiry'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}