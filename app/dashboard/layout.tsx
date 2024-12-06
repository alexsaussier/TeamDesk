import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import Navbar from "@/components/Navbar"
import { AuthProvider } from '@/components/AuthProvider'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Resource Allocation Dashboard",
  description: "Manage consultant assignments and project statuses",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.className} flex h-screen`}>
      <AuthProvider>
        <Navbar />
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </AuthProvider>
    </div>
  )
} 