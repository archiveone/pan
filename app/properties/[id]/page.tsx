'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PropertyType, Property, User } from '@prisma/client';
import { toast } from 'sonner';

interface PropertyWithOwner extends Property {
  owner: Pick<User, 'id' | 'name' | 'email' | 'image'>;
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [property, setProperty] = useState<PropertyWithOwner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isContactingAgent, setIsContactingAgent] = useState(false);

  useEffect(() => {
    fetchPropertyDetails();
  }, [params.id]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await fetch(`/api/properties/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch property details');
      const data = await response.json();
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactAgent = async () => {
    if (!session) {
      toast.error('Please sign in to contact the agent');
      return;
    }

    setIsContactingAgent(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: property?.owner.id,
          propertyId: property?.id,
          message: `Interested in property: ${property?.title}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      toast.success('Message sent to agent successfully!');
    } catch (error) {
      console.error('Error contacting agent:', error);
      toast.error('Failed to send message to agent');
    } finally {
      setIsContactingAgent(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Property not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
          
          {/* Property Images */}
          <div className="aspect-video bg-gray-200 rounded-lg mb-6">
            {/* Image placeholder - will be implemented in next phase */}
            <div className="h-full flex items-center justify-center text-gray-500">
              Property Images Coming Soon
            </div>
          </div>

          {/* Property Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{property.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">£{property.price.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{property.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{property.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Contact Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  {property.owner.image ? (
                    <img
                      src={property.owner.image}
                      alt={property.owner.name || 'Agent'}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  )}
                  <div>
                    <p className="font-medium">{property.owner.name}</p>
                    <p className="text-sm text-gray-500">{property.owner.email}</p>
                  </div>
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleContactAgent}
                  disabled={isContactingAgent || !session}
                >
                  {isContactingAgent ? 'Sending...' : 'Contact Agent'}
                </Button>
                
                {!session && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Please sign in to contact the agent
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}