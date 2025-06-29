"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSession, signIn } from 'next-auth/react'

export default function PublicNavbar() {
  const { data: session, status } = useSession()
  
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8">
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center py-4 px-6 bg-white/20 backdrop-blur-sm transition-all duration-200">
        <div className="text-2xl font-bold text-blue-800">
          <Link href="/">TeamDesk</Link>
        </div>
        
        {/* Center - Pricing Button (always visible) */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Button asChild variant="ghost" className="text-blue-800">
            <Link href="/pricing">Pricing</Link>
          </Button>
        </div>

        {/* Right side - Auth buttons */}
        <div className="space-x-4">
          {status === 'authenticated' && session.user ? (
            <div className="flex items-center space-x-3">
              <span className="text-blue-700">Welcome, {session.user.name || session.user.email}</span>
              <Button asChild variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              {/* Try For Free Button */}
              <Button 
                asChild 
                className="bg-white font-bold border border-blue-300/30 transition-colors hover:bg-blue-100"
              >
                <Link href="/auth/signup" className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent">
                    Get Started For Free
                  </span>
                </Link>
              </Button>

              {/* Sign In Button */}
              <Button 
                variant="outline"
                onClick={() => signIn()} 
                className="bg-white text-blue-800 border border-blue-800"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
} 