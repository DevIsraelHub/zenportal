'use client'

import { useEffect, useState } from 'react'
import { useUser } from "@auth0/nextjs-auth0"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Calendar,
  CreditCard,
  Shield,
  Settings,
  Edit,
  Download,
  Bell,
  Key,
  Globe,
  Zap
} from 'lucide-react'

interface UserData {
  user: {
    id: string
    email: string
    name: string
    picture: string
    subscription: {
      status: string
      plan: string
      currentPeriodStart?: string
      currentPeriodEnd?: string
      cancelAtPeriodEnd: boolean
      stripeCustomerId?: string
    } | null
    recentUsage: Array<{
      id: string
      type: string
      amount: number
      description?: string
      createdAt: string
    }>
  }
}

export default function Profile() {
  const { user, isLoading } = useUser()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetch('/api/user')
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(json => {
          setUserData(json)
        })
        .catch((err) => {
          console.error('Error fetching user data:', err)
        })
        .finally(() => setLoading(false))
    }
  }, [user])

  if (isLoading || loading) {
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

  if (!user || !userData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load profile data</p>
      </div>
    )
  }

  const subscription = userData.user.subscription
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500'
      case 'PAST_DUE': return 'bg-yellow-500'
      case 'CANCELED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'MAX': return 'bg-purple-500'
      case 'ADVANCED': return 'bg-blue-500'
      case 'CORE': return 'bg-green-500'
      case 'STARTER': return 'bg-orange-500'
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
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and view your subscription details.
        </p>
      </motion.div>

      {/* Profile Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Overview
            </CardTitle>
            <CardDescription>
              Your account information and subscription status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.picture} alt={user.name || "Profile"} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{user.name}</h3>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {subscription ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(subscription.status)}`} />
                        <span className="text-sm font-medium capitalize">
                          {subscription.status.toLowerCase().replace('_', ' ')}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${getPlanColor(subscription.plan)} text-white border-0`}
                      >
                        {subscription.plan} Plan
                      </Badge>
                    </>
                  ) : (
                    <Badge variant="outline">Free Plan</Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Details
              </CardTitle>
              <CardDescription>
                Your account information and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">User ID</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {userData.user.id.slice(-8)}
                  </code>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Member Since</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Authentication</span>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Secure</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscription Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Details
              </CardTitle>
              <CardDescription>
                Your current subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Plan</span>
                    <Badge
                      variant="outline"
                      className={`${getPlanColor(subscription.plan)} text-white border-0`}
                    >
                      {subscription.plan}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(subscription.status)}`} />
                      <span className="text-sm capitalize">
                        {subscription.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {subscription.currentPeriodEnd && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Next Billing</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  )}

                  {subscription.cancelAtPeriodEnd && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Your subscription will be canceled at the end of the current billing period.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">No active subscription</p>
                  <Button size="sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your recent usage and account activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userData.user.recentUsage && userData.user.recentUsage.length > 0 ? (
              <div className="space-y-3">
                {userData.user.recentUsage.slice(0, 5).map((usage, index) => (
                  <div key={usage.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">{usage.description || usage.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(usage.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {usage.amount} credits
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common account management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Settings className="h-5 w-5" />
                <span className="text-sm">Account Settings</span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <CreditCard className="h-5 w-5" />
                <span className="text-sm">Billing</span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Key className="h-5 w-5" />
                <span className="text-sm">Security</span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Download className="h-5 w-5" />
                <span className="text-sm">Export Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}