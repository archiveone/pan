import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Verification Success - GREIA',
  description: 'Your identity has been verified',
};

export default async function VerificationSuccessPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container max-w-2xl py-16">
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <CheckCircle className="h-12 w-12 text-primary" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Verification Complete!</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Your identity has been verified successfully.
        </p>

        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">What's Next?</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>✓ Your profile now shows as verified</li>
            <li>✓ Access to verified-only features</li>
            <li>✓ Enhanced trust with other users</li>
            <li>✓ Priority support access</li>
          </ul>
        </div>

        <div className="mt-12 flex space-x-4">
          <Button asChild size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/profile">View Profile</Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Need help? Contact our{' '}
          <Link
            href="/support"
            className="text-primary underline-offset-4 hover:underline"
          >
            support team
          </Link>
        </p>
      </div>
    </div>
  );
}