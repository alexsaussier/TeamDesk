"use client"

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SignInButton() {
  return (
    <div className="space-x-2">
      
      <Button variant="default" asChild className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white transition-all duration-200 shadow-md hover:shadow-lg">
        <Link href="/request-demo">Request a Demo</Link>
      </Button>

      <Button onClick={() => signIn()} variant="outline">
        Sign In
      </Button>
    </div>
  )
} 