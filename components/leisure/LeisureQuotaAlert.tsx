import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import Link from 'next/link';

interface LeisureQuotaAlertProps {
  quotaUsed: number;
  quotaLimit: number;
  isPro: boolean;
}

export function LeisureQuotaAlert({ quotaUsed, quotaLimit, isPro }: LeisureQuotaAlertProps) {
  const remainingQuota = quotaLimit - quotaUsed;
  const isLowQuota = remainingQuota <= 1;
  const isQuotaExceeded = remainingQuota <= 0;

  if (isPro) return null;

  return (
    <Alert className="mb-6">
      <Info className="h-4 w-4" />
      <AlertTitle>Leisure Listing Quota</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          {isQuotaExceeded ? (
            'You have used all your free leisure listings for this month.'
          ) : (
            `You have ${remainingQuota} free leisure ${
              remainingQuota === 1 ? 'listing' : 'listings'
            } remaining this month.`
          )}
        </p>
        {(isLowQuota || isQuotaExceeded) && (
          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/pro">
                Upgrade to PRO for unlimited listings
              </Link>
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}