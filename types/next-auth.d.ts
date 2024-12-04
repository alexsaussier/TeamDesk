import 'next-auth'
import 'next-auth/jwt'

// Extend the NextAuth User and Session interfaces to include organizationId
declare module 'next-auth' {
  interface User {
    organizationId: string
  }

  interface Session {
    user: User & {
      organizationId: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    organizationId: string
  }
} 