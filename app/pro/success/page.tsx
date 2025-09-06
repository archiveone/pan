import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Subscription Success - GREIA',
  description: 'Your PRO subscription has been activated',
};

export default async function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (!searchParams.session_id) {
    redirect('/pro');
  }

  return (
    <div className="container max-w-2xl py-16">
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <CheckCircle className="h-12 w-12 text-primary" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Welcome to GREIA PRO!</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Your subscription has been activated successfully.
        </p>

        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">What's Next?</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>✓ Create unlimited leisure listings</li>
            <li>✓ Access featured listings across all categories</li>
            <li>✓ Explore advanced analytics and insights</li>
            <li>✓ Get priority support</li>
          </ul>
        </div>

        <div className="mt-12 flex space-x-4">
          <Button asChild size="lg">
            <Link href="/leisure/create">Create Leisure Listing</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
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