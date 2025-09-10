'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Chrome, Mail, Lock, ArrowLeft, Satellite, Navigation } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
      toast.success('Successfully signed in with Google!')
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signInWithEmail(email, password)
      toast.success('Successfully signed in!')
      router.push('/')
      resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setIsLoading(true)
    try {
      await signUpWithEmail(email, password)
      toast.success('Account created successfully!')
      router.push('/')
      resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Satellite className="absolute top-20 right-1/4 w-8 h-8 text-primary/20 animate-float" />
        <Navigation className="absolute bottom-1/3 left-1/4 w-6 h-6 text-secondary/20 animate-float delay-1000" />
        <div className="absolute top-1/3 left-1/6 w-2 h-2 bg-primary/20 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-secondary/20 rounded-full animate-ping delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="text-center lg:text-left space-y-8">
            <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            
            <div className="space-y-6">
              {/* Main Logo */}
              <div className="flex justify-center lg:justify-start">
                <div className="p-4 bg-white/95 rounded-2xl shadow-2xl backdrop-blur-md border border-white/30 hover:shadow-3xl transition-all duration-300">
                  <Image
                    src="/Logo.png"
                    alt="GNSS-R Portal Logo"
                    width={120}
                    height={120}
                    className="rounded-xl"
                  />
                </div>
              </div>
              
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  GNSS-R Portal
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                  Advanced Satellite Signal Analysis & Ocean Remote Sensing
                </p>
              </div>

              {/* IIT Tirupati Logo */}
              <div className="flex items-center justify-center lg:justify-start space-x-4 p-4 bg-white/95 rounded-xl shadow-xl backdrop-blur-md border border-white/30 hover:shadow-2xl transition-all duration-300">
                <div className="p-2 bg-white/90 rounded-lg shadow-lg">
                  <Image
                    src="/IIT_Tirupati_logo.svg"
                    alt="IIT Tirupati"
                    width={48}
                    height={48}
                    className="rounded-md"
                  />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Indian Institute of Technology</p>
                  <p className="text-xs text-muted-foreground">Tirupati</p>
                </div>
              </div>

              <div className="hidden lg:block space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Real-time CYGNSS satellite data analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Delay-Doppler Map visualization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Ocean surface wind & wave analysis</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="glass-card shadow-2xl border-primary/10">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to access your GNSS-R analysis dashboard
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="space-y-4">
                    {/* Google Sign In */}
                    <Button
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full h-12 text-base glass border-primary/20 hover:border-primary/40"
                    >
                      <Chrome className="mr-3 h-5 w-5" />
                      Continue with Google
                    </Button>
                    
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-primary/20" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-3 text-muted-foreground">
                          Or continue with email
                        </span>
                      </div>
                    </div>
                    
                    {/* Email Sign In */}
                    <form onSubmit={handleEmailSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 glass border-primary/20"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-12 glass border-primary/20"
                            required
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full h-12 text-base bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-all duration-300"
                      >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4">
                    {/* Google Sign Up */}
                    <Button
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full h-12 text-base glass border-primary/20 hover:border-primary/40"
                    >
                      <Chrome className="mr-3 h-5 w-5" />
                      Continue with Google
                    </Button>
                    
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-primary/20" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-3 text-muted-foreground">
                          Or create account with email
                        </span>
                      </div>
                    </div>
                    
                    {/* Email Sign Up */}
                    <form onSubmit={handleEmailSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 glass border-primary/20"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-12 glass border-primary/20"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 h-12 glass border-primary/20"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full h-12 text-base bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-all duration-300"
                      >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <p className="text-center text-xs text-muted-foreground mt-6">
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
