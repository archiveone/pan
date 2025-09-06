import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ServiceCard } from '@/components/services/ServiceCard';
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
  title: 'Services - GREIA',
  description: 'Find and book services on GREIA platform',
};

interface ServicesPageProps {
  searchParams: {
    category?: string;
  };
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const session = await getServerSession(authOptions);
  const { category } = searchParams;

  // Get active services
  const services = await prisma.service.findMany({
    where: {
      status: 'ACTIVE',
      paidUntil: {
        gt: new Date(),
      },
      ...(category && { category }),
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

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="mt-2 text-muted-foreground">
            Find trusted service providers in your area
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            defaultValue={category}
            onValueChange={(value) => {
              const url = new URL(window.location.href);
              if (value) {
                url.searchParams.set('category', value);
              } else {
                url.searchParams.delete('category');
              }
              window.location.href = url.toString();
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="TRADES">Trades</SelectItem>
              <SelectItem value="PROFESSIONAL">Professional</SelectItem>
              <SelectItem value="SPECIALIST">Specialist</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          {session?.user && (
            <Button asChild>
              <Link href="/services/create">List Your Service</Link>
            </Button>
          )}
        </div>
      </div>

      {services.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed">
          <h2 className="text-xl font-semibold">No Services Found</h2>
          <p className="mt-2 text-muted-foreground">
            {category
              ? 'No services found in this category'
              : 'No services are currently available'}
          </p>
          {session?.user && (
            <Button asChild className="mt-4">
              <Link href="/services/create">List Your Service</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              showActions
              isOwner={service.provider.id === session?.user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}