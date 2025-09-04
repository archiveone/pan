'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PLANS, PlanId, formatPrice } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionData {
  id: string;
  plan: PlanId;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  defaultPaymentMethod?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (!response.ok) throw new Error('Failed to fetch subscription');
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: PlanId) => {
    try {
      setUpgrading(true);
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) throw new Error('Failed to upgrade subscription');
      
      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('Failed to upgrade subscription');
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancel = async () => {
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to cancel subscription');
      
      toast.success('Subscription cancelled successfully');
      setShowCancelDialog(false);
      fetchSubscription();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const handleManagePayment = async () => {
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to access billing portal');
      
      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      console.error('Error accessing billing portal:', error);
      toast.error('Failed to access billing portal');
    }
  };

  if (loading) {
    return <div>Loading subscription details...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Current Subscription */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>
              Your current plan and billing details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">
                  {PLANS[subscription.plan].name}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatPrice(PLANS[subscription.plan].price)}/month
                </p>
              </div>
              <Badge variant={subscription.status === 'active' ? 'success' : 'warning'}>
                {subscription.status}
              </Badge>
            </div>

            {subscription.defaultPaymentMethod && (
              <div>
                <h4 className="text-sm font-medium mb-2">Payment Method</h4>
                <div className="flex items-center gap-2">
                  <span className="capitalize">{subscription.defaultPaymentMethod.brand}</span>
                  <span>•••• {subscription.defaultPaymentMethod.last4}</span>
                  <span>
                    {subscription.defaultPaymentMethod.expMonth}/
                    {subscription.defaultPaymentMethod.expYear}
                  </span>
                </div>
              </div>
            )}

            {subscription.cancelAtPeriodEnd && (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  Your subscription will end on{' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={handleManagePayment}
            >
              Manage Payment
            </Button>
            {!subscription.cancelAtPeriodEnd && (
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
              >
                Cancel Subscription
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(PLANS).map(([id, plan]) => (
          <Card
            key={id}
            className={`relative ${
              subscription?.plan === id ? 'border-primary' : ''
            }`}
          >
            {subscription?.plan === id && (
              <div className="absolute -top-2 -right-2">
                <Badge>Current Plan</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">
                {formatPrice(plan.price)}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleUpgrade(id as PlanId)}
                disabled={
                  upgrading ||
                  subscription?.plan === id ||
                  (subscription?.status === 'active' && !subscription?.cancelAtPeriodEnd)
                }
              >
                {subscription?.plan === id
                  ? 'Current Plan'
                  : subscription?.status === 'active' && !subscription?.cancelAtPeriodEnd
                  ? 'Contact Support to Change'
                  : 'Select Plan'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your current billing period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
            >
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}