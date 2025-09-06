'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export function VerifyIdentityForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const startVerification = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/verify-identity', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start verification');
      }

      const data = await response.json();
      setVerificationUrl(data.url);

      // Open Stripe verification in new window
      const verificationWindow = window.open(data.url, '_blank');
      
      // Poll for verification status
      const checkStatus = async () => {
        const statusResponse = await fetch('/api/verify-identity', {
          method: 'GET',
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          
          if (statusData.verified) {
            verificationWindow?.close();
            toast({
              title: 'Identity Verified',
              description: 'Your identity has been successfully verified.',
              variant: 'success',
            });
            router.refresh();
            return;
          }
        }

        // Continue polling every 2 seconds
        setTimeout(checkStatus, 2000);
      };

      checkStatus();

    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Verification Error',
        description: 'Failed to start identity verification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center">
        <Button
          onClick={startVerification}
          disabled={isLoading}
          size="lg"
          className="w-full md:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting Verification...
            </>
          ) : (
            'Start Identity Verification'
          )}
        </Button>

        {verificationUrl && (
          <p className="mt-4 text-sm text-gray-600 text-center">
            A new window has opened to complete your verification. 
            If it was blocked, please{' '}
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              click here
            </a>
            .
          </p>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>
          By proceeding with verification, you agree to our{' '}
          <a href="/legal/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/legal/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}