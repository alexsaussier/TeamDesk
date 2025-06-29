import type { Metadata } from "next"
import { Lato } from "next/font/google"
import "./globals.css"
import { AuthProvider } from '@/components/AuthProvider'
import { Toaster } from "@/components/ui/toaster"

const lato = Lato({ 
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  display: "swap"
})

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
      <body className={lato.className}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}