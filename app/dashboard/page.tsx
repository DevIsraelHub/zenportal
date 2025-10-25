"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

import { ArrowUpRight, Zap, CreditCard, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"
import { useUser } from "@auth0/nextjs-auth0"
import { toast } from 'sonner'

export default function DashboardPage() {
  const { user } = useUser()

  if (!user) return null

  const stats = [
    {
      title: "AI Credits Used",
      value: "2,847",
      change: "+12.5%",
      icon: Zap,
      color: "text-primary",
    },
    {
      title: "API Calls",
      value: "12,459",
      change: "+8.2%",
      icon: Activity,
      color: "text-accent",
    },
    {
      title: "Active Integrations",
      value: "8",
      change: "+2",
      icon: TrendingUp,
      color: "text-chart-2",
    },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, {user.name}</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Here's what's happening with your account today.
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-chart-2">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Current Plan */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl md:text-2xl font-bold capitalize">{user.plan} Plan</p>
                <p className="text-sm text-muted-foreground">
                  {user.plan === "free" ? "Limited features" : "Full access to all features"}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>

            {user.plan === "free" && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Credits Used</span>
                    <span className="font-medium">2,847 / 5,000</span>
                  </div>
                  <Progress value={57} className="h-2" />
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={async () => {
                    const priceId = process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
                    const res = await fetch('/api/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ priceId, email: user.email, auth0Id: (user as any).sub }),
                    })
                    const data = await res.json()
                    if (data.url) window.location.href = data.url
                  }}
                >
                  Upgrade to Pro
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}

            {user.plan !== "free" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next billing date</span>
                  <span className="font-medium">Jan 15, 2025</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/billing/portal', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                      })

                      const data = await res.json()

                      if (res.ok && data.url) {
                        window.location.href = data.url
                      } else {
                        toast.error("Billing Portal Error", {
                          description: data.error || "Failed to open billing portal. Please try again."
                        })
                      }
                    } catch (error) {
                      console.error('Error opening billing portal:', error)
                      toast.error("Billing Portal Error", {
                        description: "An unexpected error occurred. Please try again."
                      })
                    }
                  }}
                >
                  Manage Billing
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest AI assistant interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Code completion request", time: "2 minutes ago", credits: 15 },
                { action: "Repository analysis", time: "1 hour ago", credits: 50 },
                { action: "Bug fix suggestion", time: "3 hours ago", credits: 25 },
                { action: "Documentation generation", time: "5 hours ago", credits: 30 },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <div className="text-sm text-muted-foreground ml-2 flex-shrink-0">{activity.credits} credits</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <Link href="/dashboard/billing">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Zap className="mr-2 h-4 w-4" />
                Connect Integration
              </Button>
            </Link>
            <Link href="/dashboard/usage">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Activity className="mr-2 h-4 w-4" />
                View Usage Report
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <CreditCard className="mr-2 h-4 w-4" />
                Update Payment Method
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
