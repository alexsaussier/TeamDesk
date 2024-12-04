"use client"

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SignInButton() {
  return (
    <div className="space-x-2">
      <Button onClick={() => signIn()} variant="default">
        Sign In
      </Button>
      <Button variant="outline" asChild>
        <Link href="/auth/signup">Sign Up</Link>
      </Button>
    </div>
  )
} 