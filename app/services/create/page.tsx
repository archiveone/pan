import { Metadata } from 'next';
import { ServiceListingForm } from '@/components/services/ServiceListingForm';

export const metadata: Metadata = {
  title: 'Create Service Listing - GREIA',
  description: 'Create a new service listing on GREIA platform',
};

export default function CreateServicePage() {
  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Service Listing</h1>
        <p className="mt-2 text-muted-foreground">
          List your service on GREIA. A €10 weekly fee applies to all service listings.
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <ServiceListingForm mode="create" />
      </div>
    </div>
  );
}