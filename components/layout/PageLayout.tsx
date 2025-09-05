import { ReactNode } from 'react';
import { MainHeader } from './MainHeader';
import { Footer } from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBreadcrumbs?: boolean;
}

export function PageLayout({
  children,
  title,
  subtitle,
  showBreadcrumbs = true
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <MainHeader />

      {/* Page Header */}
      {title && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {showBreadcrumbs && (
              <nav className="mb-4">
                <ol className="flex space-x-2 text-sm text-muted-foreground">
                  <li>
                    <a href="/" className="hover:text-foreground">
                      Home
                    </a>
                  </li>
                  <li>/</li>
                  <li className="text-foreground">{title}</li>
                </ol>
              </nav>
            )}
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-lg text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Example usage for Properties page
export function PropertiesLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout
      title="Properties"
      subtitle="Browse and discover properties worldwide"
    >
      {children}
    </PageLayout>
  );
}

// Example usage for Services page
export function ServicesLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout
      title="Services"
      subtitle="Find professional services and skilled trades"
    >
      {children}
    </PageLayout>
  );
}

// Example usage for Leisure page
export function LeisureLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout
      title="Leisure"
      subtitle="Discover experiences and activities"
    >
      {children}
    </PageLayout>
  );
}

// Example usage for Network page
export function NetworkLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout
      title="Network"
      subtitle="Connect with professionals and grow your network"
    >
      {children}
    </PageLayout>
  );
}

// Example usage for Add Listing page
export function AddListingLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout
      title="Add Listing"
      subtitle="Create a new property, service, or leisure listing"
      showBreadcrumbs={false}
    >
      {children}
    </PageLayout>
  );
}

// Example usage for Profile page
export function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout
      showBreadcrumbs={false}
    >
      {children}
    </PageLayout>
  );
}