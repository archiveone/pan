'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Shield } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function VerificationButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVerification = async () => {
    try {
      setIsLoading(true);

      // Create verification session
      const response = await fetch('/api/verification/create-session', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create verification session');
      }

      const { clientSecret } = await response.json();

      // Redirect to Stripe Identity verification
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { error } = await stripe.verifyIdentity(clientSecret);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Error',
        description: 'Failed to start verification process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleVerification}
      disabled={isLoading}
      size="lg"
      className="w-full"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Shield className="mr-2 h-4 w-4" />
      )}
      {isLoading ? 'Processing...' : 'Verify Identity'}
    </Button>
  );
}