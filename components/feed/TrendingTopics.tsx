import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, Building2, Briefcase, Compass } from 'lucide-react';

interface TrendingTopic {
  id: string;
  title: string;
  category: 'property' | 'service' | 'leisure' | 'network';
  count: number;
  link: string;
}

const trendingTopics: TrendingTopic[] = [
  {
    id: '1',
    title: 'Luxury Apartments',
    category: 'property',
    count: 1234,
    link: '/search?q=luxury+apartments'
  },
  {
    id: '2',
    title: 'Interior Design',
    category: 'service',
    count: 856,
    link: '/search?q=interior+design'
  },
  {
    id: '3',
    title: 'Yacht Rentals',
    category: 'leisure',
    count: 645,
    link: '/search?q=yacht+rentals'
  },
  {
    id: '4',
    title: 'Real Estate Investment',
    category: 'network',
    count: 532,
    link: '/search?q=real+estate+investment'
  },
  {
    id: '5',
    title: 'Smart Homes',
    category: 'property',
    count: 423,
    link: '/search?q=smart+homes'
  }
];

const categoryIcons = {
  property: Building2,
  service: Briefcase,
  leisure: Compass,
  network: TrendingUp
};

export function TrendingTopics() {
  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {trendingTopics.map((topic) => {
          const Icon = categoryIcons[topic.category];
          
          return (
            <Link
              key={topic.id}
              href={topic.link}
              className="block"
            >
              <div className="group flex items-start justify-between hover:bg-accent hover:text-accent-foreground p-2 rounded-lg transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{topic.title}</span>
                  </div>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {topic.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {topic.count.toLocaleString()} posts
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  View
                </Button>
              </div>
            </Link>
          );
        })}
      </div>
    </ScrollArea>
  );
}