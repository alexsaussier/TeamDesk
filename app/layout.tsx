import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from '@/components/AuthProvider'
import SignInButton from '@/components/SignInButton'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Resource Allocation App",
  description: "Manage consultant assignments and project statuses",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}