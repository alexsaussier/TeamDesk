'use client'

import React, { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import FloatingBackground from '@/components/FloatingBackground'

export default function SignInPage() {
  const { status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials. Please try again.')
      } else if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (_error) {
      setError('An error occurred. Please try again.')
    }
  }

  // Don't render the form if already authenticated
  if (status === 'authenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
      <FloatingBackground />
      
      {/* Logo in top left corner */}
      <div className="fixed top-0 left-0 z-50 p-6">
        <div className="text-2xl font-bold text-blue-800">
          <Link href="/">TeamDesk</Link>
        </div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-12 px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center backdrop-blur-sm py-4">
            <h1 className="text-4xl font-medium bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="mt-2 text-gray-600">
              Sign in to your account
            </p>
          </div>

          {/* Sign In Form */}
          <Card className="bg-white/60 backdrop-blur-sm border border-sky-100/50 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                Sign In
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="backdrop-blur-sm bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="backdrop-blur-sm bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit"
                  className="w-full backdrop-blur-md bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Sign In
                </Button>
              </form>

              <div className="text-center space-y-2">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white/60 text-gray-500">Or</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <Link 
                    href="/auth/signup" 
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 