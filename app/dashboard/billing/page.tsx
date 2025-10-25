'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Calendar,
  DollarSign,
  Download,
  ExternalLink,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface BillingData {
  user: {
    subscription: {
      status: string
      plan: string
      currentPeriodStart: string
      currentPeriodEnd: string
      cancelAtPeriodEnd: boolean
      stripeCustomerId?: string
    } | null
  }
}

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(json => {
        setData(json)
      })
      .catch((err) => {
        console.error('Error fetching user', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleBillingPortal = async () => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Billing portal error:', error)

        // Show user-friendly error message
        if (error.error === 'Internal server error') {
          alert('Billing portal is not configured. Please set up your Stripe billing portal configuration in the Stripe Dashboard.')
        } else {
          alert(`Error: ${error.error}`)
        }
        return
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error opening billing portal:', error)
      alert('Failed to open billing portal. Please try again.')
    }
  }

  const startCheckout = async (priceId: string) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const result = await response.json()

      if (response.ok && result.url) {
        window.location.href = result.url
      } else {
        toast.error("Subscription Error", {
          description: result.error || "Failed to start checkout. Please try again."
        })
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error("Checkout Error", {
        description: "An unexpected error occurred. Please try again."
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded"></div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  const subscription = data?.user?.subscription ?? null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500'
      case 'PAST_DUE': return 'bg-yellow-500'
      case 'CANCELED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription, payment methods, and billing history.
        </p>
      </motion.div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
            <CardDescription>
              Your active subscription details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{subscription.plan} Plan</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(subscription.status)}`} />
                      <span className="text-sm text-muted-foreground capitalize">
                        {subscription.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <Badge variant={subscription.plan === 'PRO' ? 'default' : 'outline'}>
                    {subscription.plan}
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Current Period</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Next Billing</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Your subscription will be canceled at the end of the current billing period.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {subscription.stripeCustomerId && (
                    <Button onClick={handleBillingPortal} className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Manage Billing
                    </Button>
                  )}
                  {subscription.plan === 'FREE' && (
                    <Button variant="outline" onClick={() => startCheckout(process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID as string)}>
                      Upgrade to Starter
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
                <p className="text-muted-foreground mb-6">
                  You&apos;re currently on the free plan. Upgrade to unlock premium features.
                </p>
                <Button onClick={() => startCheckout(process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID as string)} className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Start Free Trial
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Billing History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>
              Your recent invoices and payment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                {/* Mock billing history */}
                {[
                  { date: '2024-01-15', amount: '$29.00', status: 'Paid', description: 'Pro Plan - January 2024' },
                  { date: '2023-12-15', amount: '$29.00', status: 'Paid', description: 'Pro Plan - December 2023' },
                  { date: '2023-11-15', amount: '$29.00', status: 'Paid', description: 'Pro Plan - November 2023' },
                ].map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.description}</p>
                      <p className="text-sm text-muted-foreground">{invoice.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{invoice.amount}</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {invoice.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No billing history available
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Choose the plan that best fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {([
                {
                  name: 'Free',
                  price: '$0',
                  period: 'month',
                  description: 'Build, test, and experiment—no commitment required.',
                  features: ['7-Day Starter Plan Trial', '25 Premium LLM Calls/day', 'Unlimited BYOK Calls'],
                  current: subscription?.plan === 'FREE',
                },
                {
                  name: 'Starter',
                  price: '$19',
                  period: 'user/month',
                  description: 'Great for light personal use, prototypes, and side projects.',
                  features: ['7-Day Free', '200 Premium LLM Calls/day', 'Unlimited Calls in Slow Mode', 'Unlimited BYOK Calls'],
                  current: subscription?.plan === 'STARTER',
                  popular: true,
                  priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID as string,
                },
                {
                  name: 'Core',
                  price: '$49',
                  period: 'user/month',
                  description: 'Professional developers and medium-sized teams.',
                  features: ['550 Premium LLM Calls/day', 'Unlimited Calls in Slow Mode', 'Unlimited BYOK Calls', 'Multi-Repository Indexing', 'Analytics Dashboard', 'SSO & Audit Logs'],
                  current: subscription?.plan === 'CORE',
                  priceId: process.env.NEXT_PUBLIC_STRIPE_CORE_PRICE_ID as string,
                },
                {
                  name: 'Advanced',
                  price: '$119',
                  period: 'user/month',
                  description: 'Premium models, enterprise controls, and throughput for automation-heavy workflows.',
                  features: ['1500 Premium LLM Calls/day', 'Access to Claude Opus 4.1', 'Unlimited Calls in Slow Mode', 'Unlimited BYOK Calls', 'Multi-Repository Indexing', 'Analytics Dashboard', 'SSO & Audit Logs'],
                  current: subscription?.plan === 'ADVANCED',
                  priceId: process.env.NEXT_PUBLIC_STRIPE_ADVANCED_PRICE_ID as string,
                },
                {
                  name: 'Max',
                  price: '$250',
                  period: 'user/month',
                  description: 'Built for high-performing developers and teams with maximum usage limits.',
                  features: ['3200 Premium LLM Calls/day', 'Access to Claude Opus 4.1', 'Unlimited Calls in Slow Mode', 'Unlimited BYOK Calls', 'Multi-Repository Indexing', 'Analytics Dashboard', 'SSO & Audit Logs'],
                  current: subscription?.plan === 'MAX',
                  priceId: process.env.NEXT_PUBLIC_STRIPE_MAX_PRICE_ID as string,
                },
              ] as Array<{
                name: string
                price: string
                period: string
                description?: string
                features: string[]
                current: boolean
                popular?: boolean
                priceId?: string
              }>).map((plan) => (
                <div key={plan.name} className={`relative p-6 border rounded-lg ${plan.popular ? 'border-primary' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary">Most Popular</Badge>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.current ? 'outline' : plan.popular ? 'default' : 'outline'}
                    disabled={plan.current}
                    onClick={plan.priceId && !plan.current ? () => startCheckout(plan.priceId as string) : undefined}
                  >
                    {plan.current ? 'Current Plan' : `Choose ${plan.name}`}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
