'use client'

import { useUser } from "@auth0/nextjs-auth0"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Zap, Users, BarChart3, Check } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from "react"
import Logo from "@/components/Logo"
import { toast } from 'sonner'
export default function HomePage() {
  const { user, isLoading, error } = useUser()
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null)

  useEffect(() => {
    console.log("isLoading", isLoading)
    console.log("error", error)
    console.log("user", user)
  }, [user])

  useEffect(() => {
    if (!user) return
    fetch('/api/user')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(json => {
        const status = json?.user?.subscription?.status
        setHasActiveSubscription(status === 'ACTIVE' || status === 'TRIALING')
      })
      .catch(() => setHasActiveSubscription(false))
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user && hasActiveSubscription === true) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-4">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground mb-8">Your subscription is active.</p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 mr-2">
              Continue to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  if (user && hasActiveSubscription === false) {
    const plans = [
      {
        name: "Free",
        description: "Build, test, and experiment— no commitment required.",
        price: "$0",
        period: "/month",
        features: [
          "30 Premium LLM Calls/day",
          "7-Day Starter Plan Trial",
          "Unlimited BYOK Calls"
        ],
        buttonText: "GET FREE",
        buttonVariant: "outline" as const,
        highlighted: false
      },
      {
        name: "Starter",
        description: "Great for light personal use, prototypes, and side projects.",
        price: "$19",
        period: "/user/month",
        features: [
          "280 Premium LLM Calls/day",
          "Auto & Auto+ AI Models",
          "Unlimited BYOK Calls"
        ],
        buttonText: "GET STARTER",
        buttonVariant: "default" as const,
        highlighted: true,
        badge: "7-Day Free"
      },
      {
        name: "Core",
        description: "Professional developers and medium-sized teams.",
        price: "$49",
        period: "/user/month",
        features: [
          "750 Premium LLM Calls/day",
          "Auto & Auto+ AI Models",
          "Unlimited BYOK Calls",
          "Multi-Repository Indexing",
          "Analytics Dashboard",
          "SSO & Audit Logs"
        ],
        buttonText: "GET CORE",
        buttonVariant: "outline" as const,
        highlighted: false
      },
      {
        name: "Advanced",
        description: "Premium models, enterprise controls, and throughput for automation-heavy workflows.",
        price: "$119",
        period: "/user/month",
        features: [
          "1500 Premium LLM Calls/day",
          "Access to Claude Opus 4.1",
          "Unlimited Calls in Slow Mode",
          "Unlimited BYOK Calls",
          "Multi-Repository Indexing",
          "Analytics Dashboard",
          "SSO & Audit Logs"
        ],
        buttonText: "CHOOSE ADVANCED",
        buttonVariant: "outline" as const,
        highlighted: false
      },
      {
        name: "Max",
        description: "Built for high-performing developers and teams with maximum usage limits.",
        price: "$250",
        period: "/user/month",
        features: [
          "3200 Premium LLM Calls/day",
          "Access to Claude Opus 4.1",
          "Unlimited Calls in Slow Mode",
          "Unlimited BYOK Calls",
          "Multi-Repository Indexing",
          "Analytics Dashboard",
          "SSO & Audit Logs"
        ],
        buttonText: "CHOOSE MAX",
        buttonVariant: "outline" as const,
        highlighted: false
      }
    ]

    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
              <a href="/auth/logout">
                <Button variant="outline">
                  Logout
                </Button>
              </a>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-5xl font-bold">Pricing</h1>
              <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                New higher limits
              </span>
            </div>
            <p className="text-xl text-muted-foreground mb-2">More power, when you need it</p>
            <h2 className="text-3xl font-bold mt-8">Essential Plans</h2>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="relative"
              >
                <Card className={`h-full ${plan.highlighted
                  ? 'bg-gradient-to-b from-primary/10 to-muted border-primary/30'
                  : ''
                  }`}>
                  {plan.badge && (
                    <div className="absolute -top-3 right-6">
                      <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-muted-foreground text-base">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="text-center">
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground text-lg">{plan.period}</span>
                    </div>

                    <ul className="space-y-3 mb-8 text-left">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-foreground">
                            {feature.includes('Auto & Auto+ AI Models') ? (
                              <>
                                <span className="underline">Auto & Auto+ AI Models</span>
                              </>
                            ) : feature.includes('Multi-Repository Indexing') ? (
                              <>
                                <span className="underline">Multi-Repository Indexing</span>
                              </>
                            ) : feature.includes('Analytics Dashboard') ? (
                              <>
                                <span className="underline">Analytics Dashboard</span>
                              </>
                            ) : feature.includes('SSO & Audit Logs') ? (
                              <>
                                <span className="underline">SSO & Audit Logs</span>
                              </>
                            ) : (
                              feature
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.buttonVariant}
                      size="lg"
                      className={`w-full ${plan.buttonVariant === 'default'
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        : ''
                        }`}
                      onClick={async () => {
                        // Free plan redirects to dashboard
                        if (plan.name === "Free") {
                          window.location.href = "/dashboard"
                          return
                        }

                        const priceMap: Record<string, string> = {
                          Starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || "",
                          Core: process.env.NEXT_PUBLIC_STRIPE_CORE_PRICE_ID || "",
                          Advanced: process.env.NEXT_PUBLIC_STRIPE_ADVANCED_PRICE_ID || "",
                          Max: process.env.NEXT_PUBLIC_STRIPE_MAX_PRICE_ID || "",
                        }
                        const priceId = priceMap[plan.name as keyof typeof priceMap]
                        if (!priceId) return

                        try {
                          const res = await fetch('/api/checkout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ priceId, email: user.email, auth0Id: (user as any).sub }),
                          })

                          const data = await res.json()

                          if (res.ok && data.url) {
                            window.location.href = data.url
                          } else {
                            toast.error("Subscription Error", {
                              description: data.error || "Failed to start checkout. Please try again."
                            })
                          }
                        } catch (error) {
                          console.error('Error starting checkout:', error)
                          toast.error("Checkout Error", {
                            description: "An unexpected error occurred. Please try again."
                          })
                        }
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Additional CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-16"
          >
            <p className="text-muted-foreground mb-6">
              Need help choosing the right plan?
              <Link href="/dashboard" className="text-foreground hover:underline ml-1">
                Contact our team
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Logo />
          <a href="/auth/login">
            <Button variant="outline">Login</Button>
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Modern Customer Portal
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience seamless authentication, subscription management, and billing
            with our production-ready customer portal built on Next.js and Stripe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth/login">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built with modern technologies and best practices for scalability,
            performance, and developer experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Shield,
              title: 'Secure Authentication',
              description: 'OAuth2 with Auth0, supporting Google and GitHub providers',
            },
            {
              icon: Zap,
              title: 'Stripe Integration',
              description: 'Complete subscription management with billing portal',
            },
            {
              icon: BarChart3,
              title: 'Analytics Dashboard',
              description: 'Real-time usage statistics and subscription insights',
            },
            {
              icon: Users,
              title: 'User Management',
              description: 'Comprehensive user profiles and account settings',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to get started?</CardTitle>
              <CardDescription>
                Sign up now and experience the future of customer portals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/auth/login?screen_hint=signup">
                <Button size="lg" className="gap-2">
                  Start Your Journey
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <Logo />
            <p className="text-sm text-muted-foreground">
              © 2024 ZenPortal. Built with Next.js, Stripe, and Auth0 By <Link href="https://www.ejehisrael.com">Ejeh</Link>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}