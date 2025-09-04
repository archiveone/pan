import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { VerifyIdentity } from '@/components/verify-identity';
import prismadb from '@/lib/prismadb';

export default async function VerifyIdentityPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  // Get user's verification status
  const user = await prismadb.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      verificationStatus: true,
      verificationError: true,
    },
  });

  if (user?.verificationStatus === 'VERIFIED') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-6">
          {user?.verificationStatus === 'PENDING' ? (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Verification in Progress</h2>
              <p className="text-muted-foreground">
                Your identity verification is being processed. This usually takes a few minutes.
                You'll be notified once the verification is complete.
              </p>
              <div className="animate-pulse flex justify-center">
                <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
              </div>
            </div>
          ) : user?.verificationStatus === 'FAILED' ? (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-destructive">Verification Failed</h2>
              <p className="text-muted-foreground">
                {user.verificationError || 'There was an issue verifying your identity.'}
              </p>
              <VerifyIdentity />
            </div>
          ) : (
            <VerifyIdentity />
          )}
          
          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold mb-2">Why do we need to verify your identity?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• To ensure the security of our marketplace</li>
              <li>• To protect all users from fraud</li>
              <li>• To comply with regulatory requirements</li>
              <li>• To maintain trust in our community</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}