import { useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';

interface Connection {
  id: string;
  name: string;
  username: string;
  image: string | null;
  title: string;
  company: string;
  verified: boolean;
  mutualConnections: number;
  specialties: string[];
}

const suggestedConnections: Connection[] = [
  {
    id: '1',
    name: 'Sarah Anderson',
    username: 'sarahanderson',
    image: '/avatars/sarah.jpg',
    title: 'Senior Real Estate Agent',
    company: 'Luxury Homes International',
    verified: true,
    mutualConnections: 15,
    specialties: ['Luxury Properties', 'Investment']
  },
  {
    id: '2',
    name: 'Michael Chen',
    username: 'michaelchen',
    image: '/avatars/michael.jpg',
    title: 'Interior Designer',
    company: 'Modern Space Design',
    verified: true,
    mutualConnections: 8,
    specialties: ['Modern Design', 'Sustainable']
  },
  {
    id: '3',
    name: 'Emma Thompson',
    username: 'emmathompson',
    image: '/avatars/emma.jpg',
    title: 'Property Developer',
    company: 'Thompson Development Group',
    verified: false,
    mutualConnections: 12,
    specialties: ['Commercial', 'Residential']
  },
  {
    id: '4',
    name: 'David Miller',
    username: 'davidmiller',
    image: '/avatars/david.jpg',
    title: 'Yacht Charter Specialist',
    company: 'Elite Marine Services',
    verified: true,
    mutualConnections: 6,
    specialties: ['Luxury Yachts', 'Events']
  },
  {
    id: '5',
    name: 'Lisa Wang',
    username: 'lisawang',
    image: '/avatars/lisa.jpg',
    title: 'Investment Advisor',
    company: 'Global Property Investments',
    verified: true,
    mutualConnections: 20,
    specialties: ['Real Estate', 'Finance']
  }
];

export function SuggestedConnections() {
  const [pendingConnections, setPendingConnections] = useState<Set<string>>(new Set());

  const handleConnect = async (connectionId: string) => {
    try {
      setPendingConnections(prev => new Set([...prev, connectionId]));
      // API call to send connection request would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      // On success, keep the button in "Pending" state
    } catch (error) {
      // On error, revert the button state
      setPendingConnections(prev => {
        const next = new Set(prev);
        next.delete(connectionId);
        return next;
      });
    }
  };

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {suggestedConnections.map((connection) => (
          <div
            key={connection.id}
            className="group flex items-start space-x-4 hover:bg-accent hover:text-accent-foreground p-2 rounded-lg transition-colors"
          >
            <Link
              href={\`/profile/\${connection.username}\`}
              className="shrink-0"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={connection.image || ''} alt={connection.name} />
                <AvatarFallback>
                  {connection.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <Link
                  href={\`/profile/\${connection.username}\`}
                  className="font-medium truncate hover:underline"
                >
                  {connection.name}
                </Link>
                {connection.verified && <VerifiedBadge />}
              </div>

              <p className="text-sm text-muted-foreground truncate">
                {connection.title} at {connection.company}
              </p>

              <div className="mt-1 flex flex-wrap gap-1">
                {connection.specialties.map((specialty, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs"
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                {connection.mutualConnections} mutual connections
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={pendingConnections.has(connection.id)}
              onClick={() => handleConnect(connection.id)}
            >
              {pendingConnections.has(connection.id) ? 'Pending' : 'Connect'}
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}