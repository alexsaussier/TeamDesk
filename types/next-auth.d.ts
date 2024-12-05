import 'next-auth'
import 'next-auth/jwt'

// Extend the NextAuth User and Session interfaces to include organizationId
declare module 'next-auth' {
  interface User {
    organizationId: string
    id: string
  }

  interface Session {
    user: User & {
      organizationId: string
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    organizationId: string
    id: string
    sub?: string
  }
} 