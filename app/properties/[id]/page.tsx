import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import { PropertyGallery } from '@/components/properties/property-gallery';
import { PropertyInfo } from '@/components/properties/property-info';
import { PropertyFeatures } from '@/components/properties/property-features';
import { PropertyLocation } from '@/components/properties/property-location';
import { PropertyContact } from '@/components/properties/property-contact';
import { PropertyAgent } from '@/components/properties/property-agent';
import { SimilarProperties } from '@/components/properties/similar-properties';

interface PropertyPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata(
  { params }: PropertyPageProps
): Promise<Metadata> {
  const property = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      propertyListing: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!property) {
    return {
      title: 'Property Not Found | GREIA',
    };
  }

  return {
    title: `${property.title} | GREIA`,
    description: property.description,
    openGraph: {
      title: property.title,
      description: property.description,
      images: property.propertyListing.images.map((image) => ({
        url: image,
        width: 1200,
        height: 630,
        alt: property.title,
      })),
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const session = await getServerSession(authOptions);
  
  // Fetch the property with all related data
  const property = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      propertyListing: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          phone: true,
          rating: true,
          createdAt: true,
          _count: {
            select: {
              listings: true,
              reviews: true,
            },
          },
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

  if (!property) {
    notFound();
  }

  // Increment view count
  if (session?.user.id !== property.user.id) {
    await prisma.listing.update({
      where: { id: params.id },
      data: {
        views: {
          create: {
            userId: session?.user.id,
          },
        },
      },
    });
  }

  // Fetch similar properties
  const similarProperties = await prisma.listing.findMany({
    where: {
      id: { not: params.id },
      propertyListing: {
        type: property.propertyListing.type,
        price: {
          gte: property.propertyListing.price * 0.8,
          lte: property.propertyListing.price * 1.2,
        },
      },
    },
    take: 4,
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

  // Check if the current user has favorited this property
  const isFavorited = session?.user ? await prisma.favorite.findUnique({
    where: {
      userId_listingId: {
        userId: session.user.id,
        listingId: params.id,
      },
    },
  }) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Property Gallery */}
      <PropertyGallery 
        images={property.propertyListing.images}
        title={property.title}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <PropertyInfo
              property={property}
              isFavorited={!!isFavorited}
              currentUser={session?.user}
            />
            
            <PropertyFeatures
              features={property.propertyListing.features}
              specifications={property.propertyListing.specifications}
            />
            
            <PropertyLocation
              location={property.propertyListing.location}
              coordinates={property.propertyListing.coordinates}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <PropertyContact
              agent={property.user}
              propertyId={property.id}
              currentUser={session?.user}
            />
            
            <PropertyAgent agent={property.user} />
          </div>
        </div>

        {/* Similar Properties */}
        <div className="mt-16">
          <SimilarProperties properties={similarProperties} />
        </div>
      </div>
    </div>
  );
}