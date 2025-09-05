import { ReactNode } from 'react';
import Link from 'next/link';
import { MainHeader } from './MainHeader';
import { Footer } from './Footer';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText, Scale, Shield } from 'lucide-react';

interface LegalLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  lastUpdated?: string;
  version?: string;
}

export function LegalLayout({
  children,
  title,
  description,
  lastUpdated,
  version
}: LegalLayoutProps) {
  const legalNavItems = [
    {
      title: 'Terms of Service',
      href: '/legal/terms',
      icon: Scale,
    },
    {
      title: 'Privacy Policy',
      href: '/legal/privacy',
      icon: Shield,
    },
    {
      title: 'Cookie Policy',
      href: '/legal/cookies',
      icon: FileText,
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainHeader />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar Navigation */}
            <div className="col-span-12 md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Legal Documents</CardTitle>
                  <CardDescription>
                    Important information about using GREIA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    {legalNavItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="h-5 w-5 text-muted-foreground" />
                          <span>{item.title}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="font-medium mb-2">Need Help?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Contact our support team for assistance with legal matters
                    </p>
                    <Button variant="outline" className="w-full">
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="col-span-12 md:col-span-9">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{title}</CardTitle>
                      {description && (
                        <CardDescription className="mt-1">
                          {description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="text-right">
                      {version && (
                        <p className="text-sm text-muted-foreground">
                          Version {version}
                        </p>
                      )}
                      {lastUpdated && (
                        <p className="text-sm text-muted-foreground">
                          Last updated: {lastUpdated}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ScrollArea className="h-[calc(100vh-24rem)] pr-6">
                    <div className="prose prose-gray max-w-none">
                      {children}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Example Terms of Service Page
export function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="Please read these terms carefully before using GREIA"
      lastUpdated="September 5, 2025"
      version="2.0.0"
    >
      {/* Terms content would go here */}
    </LegalLayout>
  );
}

// Example Privacy Policy Page
export function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="Learn how we collect and use your data"
      lastUpdated="September 5, 2025"
      version="1.5.0"
    >
      {/* Privacy policy content would go here */}
    </LegalLayout>
  );
}

// Example Cookie Policy Page
export function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      description="Information about how we use cookies"
      lastUpdated="September 5, 2025"
      version="1.2.0"
    >
      {/* Cookie policy content would go here */}
    </LegalLayout>
  );
}