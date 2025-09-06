import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { VerifyIdentityForm } from './components/verify-identity-form';

export const metadata: Metadata = {
  title: 'Verify Identity - GREIA',
  description: 'Verify your identity to access all features of GREIA platform.',
};

export default async function VerifyIdentityPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Verify Your Identity</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Why verify your identity?</h2>
            <p className="text-gray-600">
              Identity verification helps us maintain a safe and trusted platform for all users.
              Verified users get access to:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>Full access to property listings</li>
              <li>Ability to create listings</li>
              <li>Direct messaging with other users</li>
              <li>Participation in private marketplace</li>
              <li>Enhanced trust and visibility</li>
            </ul>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">What you'll need:</h2>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>A valid government-issued photo ID</li>
                <li>A device with a camera for selfie verification</li>
                <li>About 5 minutes of your time</li>
              </ul>
            </div>

            <div className="mt-8">
              <VerifyIdentityForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}