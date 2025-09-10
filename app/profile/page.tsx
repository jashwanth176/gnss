'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Mail, Calendar, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date: string | undefined | null) => {
    if (!date) return 'Unknown'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
                <h1 className="text-3xl font-bold text-black">Profile</h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || user.email || ''} />
                    <AvatarFallback className="text-lg">
                      {getInitials(user.displayName || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>{user.displayName || 'GNSS User'}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                  <div className="flex justify-center mt-4">
                    <Badge variant="secondary" className="flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      {user.emailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Account Information */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Your account details and authentication information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(user.metadata.creationTime)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Last Sign In</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(user.metadata.lastSignInTime)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">User ID</label>
                      <div className="text-xs font-mono bg-muted p-2 rounded">
                        {user.uid}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Authentication Providers</label>
                    <div className="flex flex-wrap gap-2">
                      {user.providerData.map((provider, index) => (
                        <Badge key={index} variant="outline">
                          {provider.providerId === 'google.com' ? 'Google' : 
                           provider.providerId === 'password' ? 'Email/Password' : 
                           provider.providerId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* GNSS-R Activity */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>GNSS-R Activity</CardTitle>
                  <CardDescription>
                    Your activity within the GNSS-R portal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Activity tracking coming soon...</p>
                    <p className="text-sm mt-2">We'll track your data downloads, analysis sessions, and more.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
