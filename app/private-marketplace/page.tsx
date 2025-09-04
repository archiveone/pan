'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { PropertySubmissionForm } from '@/components/private-marketplace/property-submission-form';
import { AgentInterestForm } from '@/components/private-marketplace/agent-interest-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface AgentInterestActionsProps {
  interestId: string;
  onSuccess: () => void;
}

const AgentInterestActions = ({ interestId, onSuccess }: AgentInterestActionsProps) => {
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleDecision = async (decision: 'ACCEPTED' | 'REJECTED') => {
    try {
      setLoading(decision === 'ACCEPTED' ? 'accept' : 'decline');
      
      await axios.patch(`/api/private-marketplace/interest/${interestId}`, {
        decision,
      });

      toast({
        title: "Success!",
        description: decision === 'ACCEPTED' 
          ? "Agent has been assigned to your property."
          : "Agent interest has been declined.",
      });

      onSuccess();
      router.refresh();
    } catch (error) {
      console.error('Decision error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not process your decision. Please try again.",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        onClick={() => handleDecision('ACCEPTED')}
        disabled={loading !== null}
        className="w-24"
      >
        {loading === 'accept' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Accept'
        )}
      </Button>
      <Button
        onClick={() => handleDecision('REJECTED')}
        variant="outline"
        disabled={loading !== null}
        className="w-24"
      >
        {loading === 'decline' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Decline'
        )}
      </Button>
    </div>
  );
};

export default async function PrivateMarketplacePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  // Get user details including verification status
  const user = await prismadb.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      role: true,
      verificationStatus: true,
      userType: true,
    },
  });

  if (!user || user.verificationStatus !== 'VERIFIED') {
    redirect('/verify-identity');
  }

  // For property owners: Get their private listings and agent interests
  const privateListings = user.userType === 'LANDLORD' ? await prismadb.privateListing.findMany({
    where: {
      userId: user.id,
    },
    include: {
      property: true,
      agentInterests: {
        include: {
          agent: {
            select: {
              name: true,
              email: true,
              agentBrokerage: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  }) : null;

  // For agents: Get available listings in their service areas
  const availableListings = user.role === 'AGENT' ? await prismadb.privateListing.findMany({
    where: {
      status: 'PENDING',
      property: {
        postcode: {
          startsWith: user.serviceAreas[0], // Match first service area (can be expanded)
        },
      },
      agentInterests: {
        none: {
          agentId: user.id, // Exclude listings the agent has already shown interest in
        },
      },
    },
    include: {
      property: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  }) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Private Marketplace</h1>

        {user.userType === 'LANDLORD' ? (
          <Tabs defaultValue="my-listings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="my-listings">My Listings</TabsTrigger>
              <TabsTrigger value="submit">Submit New Property</TabsTrigger>
            </TabsList>

            <TabsContent value="my-listings">
              <div className="grid gap-6">
                {privateListings?.map((listing) => (
                  <Card key={listing.id}>
                    <CardHeader>
                      <CardTitle>{listing.property.title}</CardTitle>
                      <CardDescription>
                        Status: {listing.status} | Posted: {listing.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Property Details</h3>
                          <p>{listing.property.description}</p>
                          <p className="mt-2">
                            Location: {listing.property.location} | 
                            Price: £{listing.property.price.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Agent Interests ({listing.agentInterests.length})</h3>
                          <div className="space-y-3">
                            {listing.agentInterests.map((interest) => (
                              <div key={interest.id} className="bg-muted p-3 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{interest.agent.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {interest.agent.agentBrokerage}
                                    </p>
                                  </div>
                                  <p className="text-sm font-medium">
                                    Commission: {interest.proposedCommission}%
                                  </p>
                                </div>
                                <p className="mt-2 text-sm">{interest.message}</p>
                                {interest.status === 'PENDING' && listing.status === 'PENDING' && (
                                  <div className="mt-3">
                                    <AgentInterestActions
                                      interestId={interest.id}
                                      onSuccess={() => router.refresh()}
                                    />
                                  </div>
                                )}
                                {interest.status !== 'PENDING' && (
                                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                                    Status: {interest.status}
                                  </p>
                                )}
                              </div>
                            ))}
                            {listing.agentInterests.length === 0 && (
                              <p className="text-muted-foreground">
                                No agent interests yet. Agents in your area will be notified of this listing.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {privateListings?.length === 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Listings Yet</CardTitle>
                      <CardDescription>
                        Submit your first property to the private marketplace to get matched with verified agents.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="submit">
              <Card>
                <CardHeader>
                  <CardTitle>Submit New Property</CardTitle>
                  <CardDescription>
                    List your property in our private marketplace to be matched with verified agents.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PropertySubmissionForm />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : user.role === 'AGENT' ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Available Properties in Your Area</h2>
            <div className="grid gap-6">
              {availableListings?.map((listing) => (
                <Card key={listing.id}>
                  <CardHeader>
                    <CardTitle>{listing.property.title}</CardTitle>
                    <CardDescription>
                      Posted: {listing.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p>{listing.property.description}</p>
                        <p className="mt-2">
                          Location: {listing.property.location} | 
                          Price: £{listing.property.price.toLocaleString()}
                        </p>
                      </div>
                      <AgentInterestForm 
                        privateListingId={listing.id}
                        onSuccess={() => router.refresh()}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {availableListings?.length === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>No Available Listings</CardTitle>
                    <CardDescription>
                      There are currently no private listings in your service areas.
                      Check back later for new opportunities.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Access Restricted</CardTitle>
              <CardDescription>
                The private marketplace is only available to verified landlords and agents.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}