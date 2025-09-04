import { Metadata } from 'next';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedListings } from '@/components/home/featured-listings';

export const metadata: Metadata = {
  title: 'GREIA - Life\'s Operating System',
  description: 'Your unified platform for Properties, Services, Leisure, and Networking.',
};

export default async function HomePage() {
  // Fetch featured listings
  const featuredListings = await prisma.listing.findMany({
    where: {
      featured: true,
    },
    take: 12,
    include: {
      propertyListing: true,
      serviceListing: true,
      leisureListing: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          rating: true,
        },
      },
      _count: {
        select: {
          favorites: true,
          views: true,
          bookings: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main>
      <HeroSection />
      <FeaturedListings listings={featuredListings} />
    </main>
  );
}