'use client';

import Link from 'next/link';
import { Star, Building2, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatDate } from '@/lib/utils';

interface PropertyAgentProps {
  agent: {
    id: string;
    name: string;
    image: string | null;
    rating: number;
    createdAt: Date;
    _count: {
      listings: number;
      reviews: number;
    };
  };
}

export function PropertyAgent({ agent }: PropertyAgentProps) {
  // Calculate member duration
  const memberSince = formatDate(agent.createdAt, 'MMMM yyyy');
  
  // Format response time based on agent's average
  const responseTime = '< 1 hour'; // This should come from agent stats

  // Calculate verification status
  const isVerified = true; // This should come from agent verification status

  return (
    <Card>
      <CardContent className="p-6">
        {/* Agent Header */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={agent.image || ''} alt={agent.name} />
            <AvatarFallback>
              {agent.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link 
                href={`/profile/${agent.id}`}
                className="text-lg font-semibold hover:text-primary transition-colors"
              >
                {agent.name}
              </Link>
              {isVerified && (
                <Badge variant="secondary" className="h-5">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span>{agent.rating.toFixed(1)}</span>
              <span>·</span>
              <span>{formatNumber(agent._count.reviews)} reviews</span>
            </div>
          </div>
        </div>

        {/* Agent Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold">
              <Building2 className="w-5 h-5 text-primary" />
              {formatNumber(agent._count.listings)}
            </div>
            <div className="text-sm text-muted-foreground">
              Active Listings
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold">
              <MessageSquare className="w-5 h-5 text-primary" />
              {formatNumber(agent._count.reviews)}
            </div>
            <div className="text-sm text-muted-foreground">
              Reviews
            </div>
          </div>
        </div>

        {/* Agent Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Typically responds in {responseTime}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="w-4 h-4" />
            <span>Member since {memberSince}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href={`/profile/${agent.id}`}>
              View Full Profile
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href={`/profile/${agent.id}/reviews`}>
              Read Reviews
            </Link>
          </Button>
        </div>

        {/* Trust Message */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          All our agents are verified and monitored for quality service
        </p>
      </CardContent>
    </Card>
  );
}