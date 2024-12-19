"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import LogoutButton from "@/components/LogoutButton"
import { Home, LayoutDashboard, Kanban, Users, Calendar } from "lucide-react"
import { usePathname } from "next/navigation"

// Reusable icon mapping with types


interface NavSection {
  icon: React.ComponentType<{ className?: string }>
  label: string
  items: {
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
  }[]
}

const navSections: NavSection[] = [
  {
    icon: LayoutDashboard,
    label: "Projects",
    items: [
      {
        href: "/dashboard/timeline",
        label: "Project Timeline",
        icon: Calendar
      },
      {
        href: "/dashboard/projects",
        label: "Project Kanban",
        icon: Kanban
      }
    ]
  },
  {
    icon: Users,
    label: "Workforce",
    items: [
      {
        href: "/dashboard/workforce",
        label: "Workforce View",
        icon: Users
      }
    ]
  }
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-gray-100 w-64 h-screen p-4">
      <div className="flex flex-col h-full">
        <Link href="/" className="text-2xl font-bold mb-8">
          TeamDesk
        </Link>
        <div className="space-y-4">
          <div>
            <Button 
              variant="ghost" 
              className={`w-full justify-start ${
                pathname === "/dashboard" ? "bg-gray-200" : "hover:bg-gray-200"
              }`} 
              asChild
            >
              <Link href="/dashboard" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
          </div>

          {navSections.map((section) => (
            <div key={section.label} className="space-y-2">
              <div className="px-4 py-1 flex items-center">
                <section.icon className="h-4 w-4 mr-2 text-gray-500" />
                <p className="text-sm text-gray-500 font-medium">{section.label}</p>
              </div>
              <div className="pl-2">
                {section.items.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={`w-full justify-start ${
                      pathname === item.href ? "bg-gray-200" : "hover:bg-gray-200"
                    }`}
                    asChild
                  >
                    <Link href={item.href} className="flex items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-auto">
          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}

