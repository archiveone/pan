'use client';

import { useState } from 'react';
import { User, Listing, ListingEnquiry } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import PropertyUploadForm from './property-upload-form';
import PropertyCard from './property-card';
import AgentInquiryForm from './agent-inquiry-form';
import InquiryList from './inquiry-list';

interface ExtendedListing extends Listing {
  _count: {
    enquiries: number;
  };
  enquiries?: Array<ExtendedEnquiry>;
  owner?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ExtendedEnquiry extends ListingEnquiry {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    isVerified: boolean;
  };
  listing?: {
    owner: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
}

interface PrivateMarketplaceViewProps {
  user: {
    id: string;
    role: string;
    isVerified: boolean;
    city: string | null;
    state: string | null;
    country: string | null;
  };
  myListings: ExtendedListing[] | null;
  availableListings: ExtendedListing[] | null;
  myInquiries: ExtendedEnquiry[] | null;
}

export default function PrivateMarketplaceView({
  user,
  myListings,
  availableListings,
  myInquiries,
}: PrivateMarketplaceViewProps) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<ExtendedListing | null>(null);

  // Handle property upload
  const handlePropertyUpload = async (data: any) => {
    try {
      const response = await fetch('/api/private-marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to upload property');

      toast({
        title: 'Success',
        description: 'Property uploaded to private marketplace',
      });
      setShowUploadForm(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload property',
        variant: 'destructive',
      });
    }
  };

  // Handle agent inquiry
  const handleInquiry = async (listingId: string, message: string) => {
    try {
      const response = await fetch('/api/private-marketplace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, message }),
      });

      if (!response.ok) throw new Error('Failed to submit inquiry');

      toast({
        title: 'Success',
        description: 'Your inquiry has been sent to the property owner',
      });
      setShowInquiryForm(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit inquiry',
        variant: 'destructive',
      });
    }
  };

  // Handle selecting agent for property
  const handleSelectAgent = async (inquiryId: string, listingId: string) => {
    try {
      const response = await fetch('/api/private-marketplace/select-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId, listingId }),
      });

      if (!response.ok) throw new Error('Failed to select agent');

      toast({
        title: 'Success',
        description: 'Agent selected successfully. They will be notified.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to select agent',
        variant: 'destructive',
      });
    }
  };

  if (!user.isVerified) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Verification Required</h2>
          <p className="mb-4">
            To access the private marketplace, you need to verify your identity.
          </p>
          <Button onClick={() => window.location.href = '/verify'}>
            Verify Identity
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Private Property Marketplace</h1>
        {user.role === 'USER' && (
          <Button onClick={() => setShowUploadForm(true)}>
            Upload Property
          </Button>
        )}
      </div>

      {showUploadForm && (
        <PropertyUploadForm
          onSubmit={handlePropertyUpload}
          onCancel={() => setShowUploadForm(false)}
        />
      )}

      <Tabs defaultValue={user.role === 'USER' ? 'my-listings' : 'available'}>
        <TabsList>
          {user.role === 'USER' && (
            <TabsTrigger value="my-listings">
              My Properties ({myListings?.length || 0})
            </TabsTrigger>
          )}
          {user.role === 'AGENT' && (
            <>
              <TabsTrigger value="available">
                Available Properties ({availableListings?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="my-inquiries">
                My Inquiries ({myInquiries?.length || 0})
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {user.role === 'USER' && (
          <TabsContent value="my-listings">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings?.map((listing) => (
                <PropertyCard
                  key={listing.id}
                  listing={listing}
                  onSelect={() => setSelectedListing(listing)}
                />
              ))}
            </div>
            {selectedListing && (
              <InquiryList
                listing={selectedListing}
                onSelectAgent={handleSelectAgent}
                onClose={() => setSelectedListing(null)}
              />
            )}
          </TabsContent>
        )}

        {user.role === 'AGENT' && (
          <>
            <TabsContent value="available">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableListings?.map((listing) => (
                  <PropertyCard
                    key={listing.id}
                    listing={listing}
                    onInquire={() => setShowInquiryForm(listing.id)}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="my-inquiries">
              <div className="space-y-4">
                {myInquiries?.map((inquiry) => (
                  <Card key={inquiry.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          {inquiry.listing?.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Submitted: {new Date(inquiry.createdAt).toLocaleDateString()}
                        </p>
                        <p className="mt-2">{inquiry.message}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Status: {inquiry.status}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      {showInquiryForm && (
        <AgentInquiryForm
          onSubmit={(message) => handleInquiry(showInquiryForm, message)}
          onCancel={() => setShowInquiryForm(null)}
        />
      )}
    </div>
  );
}