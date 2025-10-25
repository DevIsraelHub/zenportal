'use client'

import { useEffect, useState } from 'react'
import { useUser } from "@auth0/nextjs-auth0"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  Zap,
  Database,
  Globe,
  Cpu,
  FileText,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  AlertCircle
} from 'lucide-react'

interface UsageData {
  user: {
    id: string
    email: string
    name: string
    subscription: {
      status: string
      plan: string
      currentPeriodStart?: string
      currentPeriodEnd?: string
    } | null
    usage: Array<{
      id: string
      type: string
      amount: number
      description?: string
      createdAt: string
    }>
  }
}

interface UsageStats {
  totalRequests: number
  totalCredits: number
  averagePerDay: number
  peakUsage: number
  currentPeriodUsage: number
  remainingCredits: number
  usageByType: Record<string, number>
  dailyUsage: Array<{
    date: string
    requests: number
    credits: number
  }>
}

export default function Usage() {
  const { user, isLoading } = useUser()
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  useEffect(() => {
    if (user) {
      fetch('/api/user')
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(json => {
          setUsageData(json)
          calculateUsageStats(json.user.usage || [])
        })
        .catch((err) => {
          console.error('Error fetching usage data:', err)
        })
        .finally(() => setLoading(false))
    }
  }, [user])

  const calculateUsageStats = (usage: any[]) => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const recentUsage = usage.filter(u => new Date(u.createdAt) >= thirtyDaysAgo)

    const totalRequests = recentUsage.reduce((sum, u) => sum + u.amount, 0)
    const totalCredits = recentUsage.reduce((sum, u) => sum + u.amount, 0)

    const usageByType = recentUsage.reduce((acc, u) => {
      acc[u.type] = (acc[u.type] || 0) + u.amount
      return acc
    }, {} as Record<string, number>)

    const dailyUsage = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayUsage = recentUsage.filter(u => {
        const usageDate = new Date(u.createdAt)
        return usageDate.toDateString() === date.toDateString()
      })

      return {
        date: date.toISOString().split('T')[0],
        requests: dayUsage.reduce((sum, u) => sum + u.amount, 0),
        credits: dayUsage.reduce((sum, u) => sum + u.amount, 0)
      }
    }).reverse()

    const peakUsage = Math.max(...dailyUsage.map(d => d.requests))
    const averagePerDay = totalRequests / 30

    setUsageStats({
      totalRequests,
      totalCredits,
      averagePerDay,
      peakUsage,
      currentPeriodUsage: totalRequests,
      remainingCredits: Math.max(0, 1000 - totalCredits), // Assuming 1000 credit limit
      usageByType,
      dailyUsage
    })
  }

  const getUsageIcon = (type: string) => {
    switch (type) {
      case 'AI_REQUEST': return <Cpu className="h-4 w-4" />
      case 'API_CALL': return <Globe className="h-4 w-4" />
      case 'INTEGRATION_SYNC': return <Database className="h-4 w-4" />
      case 'EXPORT_REPORT': return <FileText className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getUsageColor = (type: string) => {
    switch (type) {
      case 'AI_REQUEST': return 'text-blue-500 bg-blue-50'
      case 'API_CALL': return 'text-green-500 bg-green-50'
      case 'INTEGRATION_SYNC': return 'text-purple-500 bg-purple-50'
      case 'EXPORT_REPORT': return 'text-orange-500 bg-orange-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  const getPlanLimits = (plan: string) => {
    switch (plan) {
      case 'MAX': return { requests: 10000, credits: 10000 }
      case 'ADVANCED': return { requests: 5000, credits: 5000 }
      case 'CORE': return { requests: 2000, credits: 2000 }
      case 'STARTER': return { requests: 1000, credits: 1000 }
      default: return { requests: 100, credits: 100 }
    }
  }

  if (isLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded"></div>
      </div>
    )
  }

  if (!user || !usageData || !usageStats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load usage data</p>
      </div>
    )
  }

  const subscription = usageData.user.subscription
  const limits = getPlanLimits(subscription?.plan || 'FREE')
  const usagePercentage = (usageStats.totalRequests / limits.requests) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="md:space-y-0 space-y-4 items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Usage Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your API usage, credits, and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Usage Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageStats.totalRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageStats.totalCredits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {usageStats.remainingCredits.toLocaleString()} remaining
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg/Day</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(usageStats.averagePerDay)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from last week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Usage</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageStats.peakUsage}</div>
              <p className="text-xs text-muted-foreground">
                Highest single day
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Usage Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Usage Progress
            </CardTitle>
            <CardDescription>
              Your current usage against your plan limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>API Requests</span>
                <span>{usageStats.totalRequests.toLocaleString()} / {limits.requests.toLocaleString()}</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(usagePercentage)}% used</span>
                <span>{limits.requests - usageStats.totalRequests} remaining</span>
              </div>
            </div>

            {usagePercentage > 80 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You're approaching your usage limit. Consider upgrading your plan.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Usage by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Usage by Type
              </CardTitle>
              <CardDescription>
                Breakdown of your usage by request type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(usageStats.usageByType).map(([type, amount]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getUsageColor(type)}`}>
                        {getUsageIcon(type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {amount} requests
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {Math.round((amount / usageStats.totalRequests) * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest usage events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(usageData.user.usage || []).length > 0 ? (
                <div className="space-y-3">
                  {(usageData.user.usage || []).slice(0, 5).map((usage) => (
                    <div key={usage.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getUsageColor(usage.type)}`}>
                          {getUsageIcon(usage.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {usage.description || usage.type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(usage.createdAt).toLocaleString()}
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
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Daily Usage Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Usage Trend
            </CardTitle>
            <CardDescription>
              Your usage patterns over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1">
              {usageStats.dailyUsage.map((day, index) => {
                const height = (day.requests / usageStats.peakUsage) * 100
                return (
                  <div
                    key={day.date}
                    className="flex-1 bg-primary/20 rounded-t hover:bg-primary/40 transition-colors"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${day.date}: ${day.requests} requests`}
                  />
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
