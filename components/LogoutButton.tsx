'use client'

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ 
      callbackUrl: '/' // Redirects to home page after signing out
    })
  }

  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-100" 
      onClick={handleLogout}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  )
} 