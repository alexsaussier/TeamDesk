import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { Adapter } from "next-auth/adapters"
import { clientPromise } from './mongodb'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from './mongodb'
import { User } from '@/models/User'
import bcrypt from 'bcryptjs'
import { SessionStrategy } from 'next-auth'
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"
import { User as NextAuthUser } from "next-auth"

export const authOptions = {
    adapter: MongoDBAdapter(clientPromise) as Adapter,
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please enter an email and password')
          }
  
          await connectDB()
  
          const user = await User.findOne({ email: credentials.email })
          if (!user) {
            throw new Error('No user found with this email')
          }
  
          const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword)
          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }
  
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            organizationId: user.organizationId,
          }
        }
      })
    ],
    session: {
      strategy: 'jwt' as SessionStrategy,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
      async jwt({ token, user }: { token: JWT; user: NextAuthUser }) {
        if (user) {
          token.organizationId = user.organizationId
          token.id = user.id || token.sub || ''
        } else {
          token.id = token.sub || token.id || ''
        }
        return token
      },
      async session({ session, token }: { session: Session; token: JWT }) {
        if (session.user) {
          session.user.organizationId = token.organizationId
          session.user.id = token.id || token.sub || ''
        }
        return session
      }
    },
    pages: {
      signIn: '/auth/signin',
    }
  }