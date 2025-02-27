"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import LogoutButton from "@/components/LogoutButton"
import { Home, LayoutDashboard, Kanban, Users, Calendar, Sofa, Menu, X, DollarSign, TrendingUp, FileText, Wand2, Briefcase } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

// Reusable icon mapping with types


interface NavSection {
  icon: React.ComponentType<{ className?: string }>
  label: string
  items: {
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    badge?: {
      text: string
      className?: string
    }
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
      },
      {
        href: "/dashboard/proposals",
        label: "Proposals",
        icon: FileText,
        badge: {
          text: "AI"
        }
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
      },
      {
        href: "/dashboard/bench",
        label: "Bench",
        icon: Sofa
      }
    ]
  },
  {
    icon: DollarSign,
    label: "Finance",
    items: [
      {
        href: "/dashboard/financials",
        label: "Financial Metrics",
        icon: TrendingUp
      }
    ]
  },
  {
    icon: Briefcase,
    label: "Recruitment",
    items: [
      {
        href: "/dashboard/recruitment",
        label: "Overview",
        icon: Briefcase
      },
      {
        href: "/dashboard/recruitment/jobs",
        label: "Jobs",
        icon: Briefcase
      }
    ]
  }
]

export default function Navbar() {
  const pathname = usePathname()
  const [orgName, setOrgName] = useState<string>("")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const response = await fetch('/api/organization')
        const data = await response.json()
        setOrgName(data.name)
        console.log("org name: ", data.name)
      } catch (error) {
        console.error('Failed to fetch organization:', error)
      }
    }
    fetchOrgData()
  }, [])

  const handleNavigation = () => {
    setIsOpen(false)
  }

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav className={`
        fixed lg:static
        w-64 h-screen p-4
        bg-gray-100
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        z-50
      `}>
        <div className="flex flex-col h-full">
          <Link href="/" className="text-2xl font-bold mb-2" onClick={handleNavigation}>
            TeamDesk
          </Link>
          {orgName && (
            <p className="text-sm text-gray-600 mb-6 px-1">{orgName}</p>
          )}
          <div className="space-y-4">
            <div>
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${
                  pathname === "/dashboard" ? "bg-gray-200" : "hover:bg-gray-200"
                }`} 
                asChild
                onClick={handleNavigation}
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
                      onClick={handleNavigation}
                    >
                      <Link href={item.href} className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                        {item.badge && (
                          <Badge variant="ai" className="ml-2">
                            {item.badge.text}
                            <Wand2 className="w-3 h-3 ml-1 text-purple-500" />
                          </Badge>
                        )}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto">
            <LogoutButton onClick={handleNavigation} />
          </div>
        </div>
      </nav>
    </>
  )
}

