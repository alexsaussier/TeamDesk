'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { useEffect } from 'react'

function SessionHandler() {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user) {
      fetch('/api/auth/session', {
        method: 'POST',
      }).catch(console.error)
    }
  }, [session])

  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={true}>
      <SessionHandler />
      {children}
    </SessionProvider>
  )
} 