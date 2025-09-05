'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { analyticsService, type ListingType } from '@/lib/analytics';

// Get or create session ID
const getSessionId = () => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Get device type
const getDeviceType = () => {
  if (typeof window === 'undefined') return 'unknown';
  
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Get UTM parameters
const getUtmParams = (searchParams: URLSearchParams) => {
  return {
    source: searchParams.get('utm_source') || undefined,
    medium: searchParams.get('utm_medium') || undefined,
    campaign: searchParams.get('utm_campaign') || undefined,
  };
};

interface AnalyticsTrackerProps {
  listingId?: string;
  listingType?: ListingType;
  searchQuery?: string;
  searchFilters?: Record<string, any>;
  resultCount?: number;
}

export function AnalyticsTracker({
  listingId,
  listingType,
  searchQuery,
  searchFilters,
  resultCount,
}: AnalyticsTrackerProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const startTimeRef = useRef<number>(Date.now());
  const sessionId = getSessionId();

  // Track page view duration
  useEffect(() => {
    startTimeRef.current = Date.now();

    return () => {
      const duration = Date.now() - startTimeRef.current;
      
      // If this is a listing view, track it
      if (listingId && listingType) {
        analyticsService.trackListingView({
          listingId,
          listingType,
          userId: session?.user?.id,
          sessionId,
          duration,
          deviceType: getDeviceType(),
          ...getUtmParams(searchParams),
          searchQuery: searchParams.get('q') || undefined,
          filters: Object.fromEntries(searchParams.entries()),
        });
      }
      
      // If this is a search page, track the search
      if (searchQuery !== undefined) {
        analyticsService.trackSearch({
          userId: session?.user?.id,
          sessionId,
          query: searchQuery,
          filters: searchFilters || {},
          resultCount: resultCount || 0,
          category: listingType,
          deviceType: getDeviceType(),
          duration,
        });
      }
    };
  }, [pathname, searchParams]);

  // Track user demographics when available
  useEffect(() => {
    if (!session?.user?.id) return;

    const updateDemographics = async () => {
      try {
        // Get location from browser
        let location;
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          // Reverse geocode the coordinates
          const response = await fetch(
            \`https://api.opencagedata.com/geocode/v1/json?q=\${position.coords.latitude}+\${position.coords.longitude}&key=\${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}\`
          );
          const data = await response.json();
          
          if (data.results?.[0]?.components) {
            const components = data.results[0].components;
            location = {
              city: components.city || components.town,
              region: components.state,
              country: components.country,
            };
          }
        } catch (error) {
          console.error('Error getting location:', error);
        }

        // Update user demographics
        await analyticsService.updateUserDemographics({
          userId: session.user.id,
          location,
          lastActive: new Date(),
        });
      } catch (error) {
        console.error('Error updating demographics:', error);
      }
    };

    updateDemographics();
  }, [session]);

  return null;
}