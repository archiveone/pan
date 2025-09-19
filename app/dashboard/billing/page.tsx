'use client'

import { useState } from 'react'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import {
  CreditCard,
  DollarSign,
  Download,
  ArrowUpDown,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Plus,
  Building2,
  Wrench,
  Car,
  Receipt,
  Shield,
  Star,
  Zap
} from 'lucide-react'

export default function BillingDashboardPage() {
  // Example billing data
  const billing = {
    plan: {
      name: 'Premium',
      price: '£29.99',
      interval: 'month',
      nextBilling: 'October 1, 2025',
      status: 'Active',
      features: [
        'Unlimited listings',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'API access'
      ]
    },
    paymentMethods: [
      {
        id: 1,
        type: 'Credit Card',
        brand: 'Visa',
        last4: '4242',
        expiry: '12/26',
        isDefault: true
      },
      {
        id: 2,
        type: 'Credit Card',
        brand: 'Mastercard',
        last4: '8888',
        expiry: '09/25',
        isDefault: false
      }
    ],
    invoices: [
      {
        id: 'INV-2025-009',
        date: 'Sep 1, 2025',
        amount: '£29.99',
        status: 'Paid'
      },
      {
        id: 'INV-2025-008',
        date: 'Aug 1, 2025',
        amount: '£29.99',
        status: 'Paid'
      },
      {
        id: 'INV-2025-007',
        date: 'Jul 1, 2025',
        amount: '£29.99',
        status: 'Paid'
      }
    ],
    usage: {
      properties: {
        current: 12,
        limit: 'Unlimited'
      },
      services: {
        current: 8,
        limit: 'Unlimited'
      },
      leisure: {
        current: 5,
        limit: 'Unlimited'
      }
    }
  }

  const plans = [
    {
      name: 'Basic',
      price: '£9.99',
      interval: 'month',
      description: 'Perfect for getting started',
      features: [
        'Up to 5 listings',
        'Basic analytics',
        'Standard support',
        'Community access'
      ]
    },
    {
      name: 'Premium',
      price: '£29.99',
      interval: 'month',
      description: 'Most popular for professionals',
      features: [
        'Unlimited listings',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'API access'
      ],
      current: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      interval: 'year',
      description: 'For large organizations',
      features: [
        'Custom solutions',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantee',
        'Training & onboarding'
      ]
    }
  ]

  return (
    <PageTransition>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription and payment methods
          </p>
        </div>

        {/* Current Plan */}
        <div className="bg-card rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">Current Plan</h2>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold">{billing.plan.price}</span>
                <span className="text-muted-foreground">/{billing.plan.interval}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-success/20 text-success px-2 py-1 rounded-full flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {billing.plan.status}
                </span>
                <span className="text-muted-foreground">
                  Next billing on {billing.plan.nextBilling}
                </span>
              </div>
            </div>
            <Button>Change Plan</Button>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Properties</div>
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {billing.usage.properties.current}
              </div>
              <div className="text-sm text-muted-foreground">
                of {billing.usage.properties.limit} listings
              </div>
            </div>
            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Services</div>
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {billing.usage.services.current}
              </div>
              <div className="text-sm text-muted-foreground">
                of {billing.usage.services.limit} listings
              </div>
            </div>
            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Leisure</div>
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {billing.usage.leisure.current}
              </div>
              <div className="text-sm text-muted-foreground">
                of {billing.usage.leisure.limit} listings
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-card rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Payment Methods</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
          <div className="space-y-4">
            {billing.paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {method.brand} ending in {method.last4}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expires {method.expiry}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {method.isDefault && (
                    <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  {!method.isDefault && (
                    <Button variant="ghost" size="sm" className="text-destructive">
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-card rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Billing History</h2>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
          <div className="space-y-4">
            {billing.invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{invoice.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{invoice.amount}</span>
                  <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                    {invoice.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Plans */}
        <div className="bg-card rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-6">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg p-6 ${
                  plan.current
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{plan.name}</h3>
                  {plan.current && (
                    <span className="text-xs bg-background/20 px-2 py-1 rounded-full">
                      Current Plan
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  {plan.price !== 'Custom' && (
                    <span className="text-sm opacity-80">/{plan.interval}</span>
                  )}
                </div>
                <p className="text-sm mb-6 opacity-80">{plan.description}</p>
                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button
                  className={plan.current ? 'bg-background/20' : ''}
                  variant={plan.current ? 'secondary' : 'default'}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Select Plan'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}