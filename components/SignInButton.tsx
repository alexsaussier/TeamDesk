"use client"

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SignInButton() {
  return (
    <div className="space-x-2">
      
      <Button variant="default" asChild>
        <Link href="/request-demo">Request a Demo</Link>
      </Button>

      <Button onClick={() => signIn()} variant="outline">
        Sign In
      </Button>
    </div>
  )
} 