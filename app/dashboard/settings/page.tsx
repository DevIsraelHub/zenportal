'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { motion } from 'framer-motion'
import {
  User,
  Bell,
  Shield,
  Palette,
  Moon,
  Sun,
  Monitor,
  Github,
  AlertTriangle,
  CheckCircle,
  Save
} from 'lucide-react'
import { useUser } from '@auth0/nextjs-auth0'
import { useState } from 'react'
import { useTheme } from '@/components/theme-provider'

export default function SettingsPage() {
  const { user } = useUser()
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      marketing: false,
    },
    integrations: {
      github: true,
      jira: false,
      sentry: true,
    },
    profile: {
      name: user?.name || '',
      email: user?.email || '',
    },
  })

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log('Saving settings:', settings)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {user?.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="bg-primary/10 text-primary w-16 h-16 rounded-full flex items-center justify-center text-lg font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={settings.profile.name}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, name: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, email: e.target.value }
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Theme Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Monitor },
                ].map((themeOption) => (
                  <Button
                    key={themeOption.value}
                    variant={theme === themeOption.value ? 'default' : 'outline'}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                    onClick={() => setTheme(themeOption.value as 'light' | 'dark' | 'system')}
                  >
                    <themeOption.icon className="h-4 w-4" />
                    <span className="text-sm">{themeOption.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified about updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'email', label: 'Email notifications', description: 'Receive updates via email' },
              { key: 'push', label: 'Push notifications', description: 'Get notified in your browser' },
              { key: 'marketing', label: 'Marketing emails', description: 'Receive product updates and tips' },
            ].map((notification) => (
              <div key={notification.key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{notification.label}</p>
                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                </div>
                <Switch
                  checked={settings.notifications[notification.key as keyof typeof settings.notifications]}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, [notification.key]: checked }
                  }))}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Integration Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Integrations
            </CardTitle>
            <CardDescription>
              Manage your connected services and third-party integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'github', label: 'GitHub', icon: Github, description: 'Connect your GitHub repositories' },
              { key: 'jira', label: 'Jira', icon: AlertTriangle, description: 'Sync with your Jira projects' },
              { key: 'sentry', label: 'Sentry', icon: CheckCircle, description: 'Monitor errors and performance' },
            ].map((integration) => (
              <div key={integration.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <integration.icon className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{integration.label}</p>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.integrations[integration.key as keyof typeof settings.integrations]}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    integrations: { ...prev.integrations, [integration.key]: checked }
                  }))}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex justify-end"
      >
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </motion.div>
    </div>
  )
}
