import { Metadata } from 'next';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedProperties } from '@/components/home/featured-properties';
import { PopularServices } from '@/components/home/popular-services';
import { TrendingExperiences } from '@/components/home/trending-experiences';
import { CommunityHighlights } from '@/components/home/community-highlights';
import { PlatformFeatures } from '@/components/home/platform-features';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { DownloadApp } from '@/components/home/download-app';

export const metadata: Metadata = {
  title: 'GREIA - Life\'s Operating System',
  description: 'Your unified platform for Properties, Services, Leisure, and Networking. Buy, rent, or sell properties, find services, book experiences, and connect with professionals.',
  openGraph: {
    title: 'GREIA - Life\'s Operating System',
    description: 'Your unified platform for Properties, Services, Leisure, and Networking.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GREIA Platform',
      },
    ],
  },
};

export default async function HomePage() {
  // Fetch featured properties
  const featuredProperties = await prisma.listing.findMany({
    where: {
      featured: true,
      type: 'PROPERTY',
    },
    take: 6,
    include: {
      propertyListing: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          favorites: true,
          views: true,
        },
      },
    },
  });

  // Fetch popular services
  const popularServices = await prisma.listing.findMany({
    where: {
      type: 'SERVICE',
    },
    orderBy: {
      views: 'desc',
    },
    take: 8,
    include: {
      serviceListing: true,
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
          reviews: true,
        },
      },
    },
  });

  // Fetch trending experiences
  const trendingExperiences = await prisma.listing.findMany({
    where: {
      type: 'LEISURE',
    },
    orderBy: {
      bookings: 'desc',
    },
    take: 6,
    include: {
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
          bookings: true,
          reviews: true,
        },
      },
    },
  });

  // Fetch community highlights
  const communityHighlights = await prisma.post.findMany({
    where: {
      featured: true,
    },
    take: 3,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          expertise: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  // Fetch testimonials
  const testimonials = await prisma.review.findMany({
    where: {
      featured: true,
    },
    take: 6,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          location: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      
      <div className="space-y-24 py-24">
        <FeaturedProperties properties={featuredProperties} />
        
        <PopularServices services={popularServices} />
        
        <TrendingExperiences experiences={trendingExperiences} />
        
        <PlatformFeatures />
        
        <CommunityHighlights highlights={communityHighlights} />
        
        <TestimonialsSection testimonials={testimonials} />
        
        <DownloadApp />
      </div>
    </div>
  );
}