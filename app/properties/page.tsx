import { Suspense } from 'react';
import { PropertyService } from '@/lib/services/propertyService';
import { PropertyGrid } from '@/components/properties/PropertyGrid';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import { PropertySearchParams } from '@/lib/types/property';

interface SearchPageProps {
  searchParams: PropertySearchParams;
}

async function getProperties(searchParams: PropertySearchParams) {
  const propertyService = new PropertyService();
  return propertyService.searchProperties(searchParams);
}

export default async function PropertiesPage({ searchParams }: SearchPageProps) {
  const { properties, total, page, totalPages } = await getProperties(searchParams);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">Properties</h1>
        <PropertyFilters />
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        {total} properties found
      </div>

      <Suspense
        fallback={
          <div className="flex h-[400px] items-center justify-center">
            Loading properties...
          </div>
        }
      >
        <PropertyGrid properties={properties} />
      </Suspense>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          {/* Add pagination component here */}
        </div>
      )}
    </main>
  );
}

export const dynamic = 'force-dynamic';