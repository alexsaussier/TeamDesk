import type { Metadata } from "next"
import "@/app/globals.css"
import Navbar from "@/components/Navbar"
import { OrganizationProvider } from "@/contexts/OrganizationContext"

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
    <OrganizationProvider>
      <div className="flex h-screen">
          <Navbar />
          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>
      </div>
    </OrganizationProvider>
  )
} 