'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Palette, Bell, Shield, Download, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function SettingsPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState({
    notifications: true,
    dataAutoDownload: false,
    analyticsSharing: true,
    emailUpdates: true,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
    toast.success('Setting updated')
  }

  const handleDeleteAccount = async () => {
    try {
      // Note: Account deletion would require additional Firebase setup
      toast.error('Account deletion is not implemented yet')
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <Image
                  src="/Logo.png"
                  alt="GNSS-R Portal"
                  width={120}
                  height={64}
                  className="rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                />
                <Image
                  src="/IIT_Tirupati_logo.svg"
                  alt="IIT Tirupati"
                  width={80}
                  height={60}
                  className="rounded-md shadow-lg hover:shadow-xl transition-all duration-300"
                />
                <h1 className="text-3xl font-bold text-black">Settings</h1>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize how the GNSS-R portal looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Theme settings removed - fixed brand theme applied sitewide */}
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about important updates
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={settings.notifications}
                    onCheckedChange={() => handleSettingChange('notifications')}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="email-updates">Email Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications about new features
                    </p>
                  </div>
                  <Switch
                    id="email-updates"
                    checked={settings.emailUpdates}
                    onCheckedChange={() => handleSettingChange('emailUpdates')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Data & Downloads
                </CardTitle>
                <CardDescription>
                  Configure how data is handled and stored
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auto-download">Auto-download Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically download new CYGNSS data when available
                    </p>
                  </div>
                  <Switch
                    id="auto-download"
                    checked={settings.dataAutoDownload}
                    onCheckedChange={() => handleSettingChange('dataAutoDownload')}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="analytics">Analytics Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the platform by sharing usage analytics
                    </p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={settings.analyticsSharing}
                    onCheckedChange={() => handleSettingChange('analyticsSharing')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Account Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Download My Data
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-destructive">Danger Zone</h4>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full justify-start">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
