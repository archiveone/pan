'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export const VerifyIdentity = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const startVerification = async () => {
    try {
      setLoading(true);
      
      // Call our API endpoint to create a Stripe VerificationSession
      const response = await axios.post('/api/stripe/identity');
      
      // Redirect to Stripe's hosted verification flow
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start verification process. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <h2 className="text-2xl font-bold text-center">Verify Your Identity</h2>
      <p className="text-muted-foreground text-center max-w-md">
        To ensure the security of our platform, we need to verify your identity. 
        This process is quick and secure, powered by Stripe Identity.
      </p>
      <Button 
        onClick={startVerification}
        disabled={loading}
        className="w-full max-w-sm"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Starting Verification...
          </>
        ) : (
          'Verify Identity'
        )}
      </Button>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        You'll need a valid government-issued photo ID and a device with a camera.
      </p>
    </div>
  );
};