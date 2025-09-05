import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: any) => void;
}

function PaymentForm({
  amount,
  currency,
  onSuccess,
  onError,
}: Omit<PaymentProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: \`\${window.location.origin}/payment/confirmation\`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentError(error.message || 'An error occurred with your payment');
        onError(error);
        toast({
          title: 'Payment Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully',
          variant: 'default',
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError('An unexpected error occurred');
      onError(err);
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
          fields: {
            billingDetails: {
              address: {
                country: 'never',
              },
            },
          },
        }}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Amount to pay:</span>
          <span className="font-medium">
            {new Intl.NumberFormat('en-IE', {
              style: 'currency',
              currency: currency.toUpperCase(),
            }).format(amount)}
          </span>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isProcessing || !stripe || !elements}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Pay Now
            </>
          )}
        </Button>
      </div>

      {paymentError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive flex items-center space-x-2"
        >
          <AlertCircle className="h-4 w-4" />
          <span>{paymentError}</span>
        </motion.div>
      )}

      <div className="text-xs text-muted-foreground space-y-2">
        <div className="flex items-center space-x-2">
          <Lock className="h-4 w-4" />
          <span>Payments are secure and encrypted</span>
        </div>
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4" />
          <span>We accept all major credit cards</span>
        </div>
      </div>
    </form>
  );
}

export function StripePayment({
  clientSecret,
  amount,
  currency,
  onSuccess,
  onError,
}: PaymentProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0099ff',
        colorBackground: '#ffffff',
        colorText: '#1a1a1a',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Secure Payment</CardTitle>
        <CardDescription>
          Complete your payment securely with Stripe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm
            amount={amount}
            currency={currency}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}

// API Route: /api/create-payment-intent
export async function createPaymentIntent(amount: number, currency: string) {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const data = await response.json();
    return data.clientSecret;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

// Example usage in a booking component:
/*
import { StripePayment, createPaymentIntent } from '@/components/payment/StripePayment';

export default function BookingCheckout() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent when the page loads
    createPaymentIntent(1000, 'eur')
      .then(setClientSecret)
      .catch(console.error);
  }, []);

  const handlePaymentSuccess = (paymentIntent: any) => {
    // Handle successful payment
    console.log('Payment successful:', paymentIntent);
  };

  const handlePaymentError = (error: any) => {
    // Handle payment error
    console.error('Payment error:', error);
  };

  if (!clientSecret) {
    return <div>Loading...</div>;
  }

  return (
    <StripePayment
      clientSecret={clientSecret}
      amount={1000}
      currency="eur"
      onSuccess={handlePaymentSuccess}
      onError={handlePaymentError}
    />
  );
}
*/