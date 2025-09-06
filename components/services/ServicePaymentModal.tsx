import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface ServicePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentIntentId: string) => void;
  mode: 'create' | 'extend';
  serviceId?: string;
}

const PaymentForm = ({ onSuccess, onClose }: { onSuccess: (id: string) => void; onClose: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: 'Payment failed',
          description: error.message,
          variant: 'destructive',
        });
      } else if (paymentIntent.status === 'succeeded') {
        toast({
          title: 'Payment successful',
          description: 'Your service listing has been created.',
        });
        onSuccess(paymentIntent.id);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pay €10
        </Button>
      </div>
    </form>
  );
};

export function ServicePaymentModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  serviceId,
}: ServicePaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string>();
  const { toast } = useToast();

  // Get payment intent when modal opens
  const getPaymentIntent = async () => {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_payment',
          serviceId: mode === 'extend' ? serviceId : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to create payment intent');

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initialize payment. Please try again.',
        variant: 'destructive',
      });
      onClose();
    }
  };

  // Initialize payment intent when modal opens
  if (isOpen && !clientSecret) {
    getPaymentIntent();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Service Listing' : 'Extend Service Listing'}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4 text-sm text-muted-foreground">
            Service listings require a €10 weekly fee. Your listing will be active for 7 days
            after payment.
          </div>
          {clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <PaymentForm onSuccess={onSuccess} onClose={onClose} />
            </Elements>
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}