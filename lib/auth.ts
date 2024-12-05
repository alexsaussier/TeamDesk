import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from './mongodb'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from './mongodb'
import { User } from '@/models/User'
import bcrypt from 'bcryptjs'
import { SessionStrategy } from 'next-auth'
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"

export const authOptions = {
    adapter: MongoDBAdapter(clientPromise) as any,
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
    },
    callbacks: {
      async jwt({ token, user }: { token: JWT; user: any }) {
        if (user) {
          token.organizationId = user.organizationId
        }
        return token
      },
      async session({ session, token }: { session: Session; token: JWT }) {
        if (session.user) {
          (session.user as any).organizationId = token.organizationId
        }
        return session
      }
    },
    pages: {
      signIn: '/auth/signin',
    }
  }