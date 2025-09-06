import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LeisureCard } from '@/components/leisure/LeisureCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const metadata: Metadata = {
  title: 'Leisure - GREIA',
  description: 'Find rentals, experiences, and events on GREIA platform',
};

interface LeisurePageProps {
  searchParams: {
    type?: 'RENTAL' | 'EXPERIENCE' | 'EVENT';
  };
}

export default async function LeisurePage({ searchParams }: LeisurePageProps) {
  const session = await getServerSession(authOptions);
  const { type } = searchParams;

  // Get active leisure listings
  const listings = await prisma.leisure.findMany({
    where: {
      status: 'ACTIVE',
      ...(type && { type }),
    },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          rating: true,
          totalReviews: true,
          isVerified: true,
        },
      },
    },
    orderBy: [
      { isFeatured: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  // If user is logged in, get their quota info
  let quotaInfo;
  if (session?.user) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        monthlyLeisureQuota: true,
        monthlyLeisureUsed: true,
        subscriptionTier: true,
      },
    });

    if (user) {
      quotaInfo = {
        remaining: user.monthlyLeisureQuota - user.monthlyLeisureUsed,
        isPro: user.subscriptionTier === 'PRO',
      };
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leisure</h1>
          <p className="mt-2 text-muted-foreground">
            Discover amazing rentals, experiences, and events
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            defaultValue={type}
            onValueChange={(value) => {
              const url = new URL(window.location.href);
              if (value) {
                url.searchParams.set('type', value);
              } else {
                url.searchParams.delete('type');
              }
              window.location.href = url.toString();
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="RENTAL">Rentals</SelectItem>
              <SelectItem value="EXPERIENCE">Experiences</SelectItem>
              <SelectItem value="EVENT">Events</SelectItem>
            </SelectContent>
          </Select>
          {session?.user && (
            <div className="flex items-center space-x-4">
              {quotaInfo && !quotaInfo.isPro && (
                <p className="text-sm text-muted-foreground">
                  {quotaInfo.remaining} listings remaining
                </p>
              )}
              <Button asChild>
                <Link href="/leisure/create">Create Listing</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed">
          <h2 className="text-xl font-semibold">No Listings Found</h2>
          <p className="mt-2 text-muted-foreground">
            {type
              ? 'No listings found in this category'
              : 'No leisure listings are currently available'}
          </p>
          {session?.user && (
            <Button asChild className="mt-4">
              <Link href="/leisure/create">Create Listing</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <LeisureCard
              key={listing.id}
              leisure={listing}
              showActions
              isOwner={listing.provider.id === session?.user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}