'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Phone, Mail, MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  viewingDate: z.string().optional(),
});

interface PropertyContactProps {
  agent: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  propertyId: string;
  currentUser: any; // Replace with proper type
}

export function PropertyContact({ 
  agent, 
  propertyId,
  currentUser 
}: PropertyContactProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showViewingDialog, setShowViewingDialog] = useState(false);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      message: 'Hi, I am interested in this property and would like to know more details.',
    },
  });

  const handleSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: agent.id,
          propertyId,
          ...values,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      toast({
        title: 'Message sent',
        description: 'Your message has been sent to the agent.',
      });

      form.reset();
      setShowViewingDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Agent</CardTitle>
        <CardDescription>
          Get in touch about this property
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Contact Options */}
          <div className="grid grid-cols-1 gap-3">
            {agent.phone && (
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <a href={`tel:${agent.phone}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  {agent.phone}
                </a>
              </Button>
            )}
            
            <Button
              variant="outline"
              className="w-full justify-start"
              asChild
            >
              <a href={`mailto:${agent.email}`}>
                <Mail className="w-4 h-4 mr-2" />
                {agent.email}
              </a>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {/* Contact Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Your email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your message here..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>

                <Dialog open={showViewingDialog} onOpenChange={setShowViewingDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Viewing
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule a Viewing</DialogTitle>
                      <DialogDescription>
                        Pick a date and time that works for you
                      </DialogDescription>
                    </DialogHeader>
                    {/* Add Calendar Component Here */}
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}