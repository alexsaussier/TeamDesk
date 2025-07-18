"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import LogoutButton from "@/components/LogoutButton"
import { Home, LayoutDashboard, Kanban, Users, Calendar, Sofa, Menu, X, DollarSign, TrendingUp, FileText, Wand2, Settings, PieChart } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Reusable icon mapping with types

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: {
    text: string
    className?: string
  }
}

interface NavSection {
  icon: React.ComponentType<{ className?: string }>
  label: string
  items: NavItem[]
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
        href: "/dashboard/workforce-timeline",
        label: "Workforce Timeline",
        icon: Calendar
      },
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
        label: "Team Metrics",
        icon: TrendingUp
      },
      {
        href: "/dashboard/project-analysis",
        label: "Project Analysis",
        icon: PieChart
      }
    ]
  },
  /*{
    icon: Briefcase,
    label: "Recruitment",
    items: [
      {
        href: "/dashboard/recruitmentxxx",
        label: "AI Recruiter",
        icon: Briefcase,
        badge: {
          text: "AI"
        }
      },
      
    ]
  }*/
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [orgName, setOrgName] = useState<string>("")
  const [orgPlanType, setOrgPlanType] = useState<string>("")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const response = await fetch('/api/organization')
        const data = await response.json()
        setOrgName(data.name)
        setOrgPlanType(data.planType)
        console.log("org name: ", data.name)
        console.log("org planType: ", data.planType)
      } catch (error) {
        console.error('Failed to fetch organization:', error)
      }
    }
    fetchOrgData()
  }, [])

  const handleNavigation = () => {
    setIsOpen(false)
  }

  const isComingSoon = (href: string) => {
    return href === "/dashboard/recruitmentxxx"
  }

  const renderNavItem = (item: NavItem) => {
    const isDisabled = isComingSoon(item.href)
    
    if (isDisabled) {
      return (
        <TooltipProvider key={item.href}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-400 cursor-not-allowed opacity-60 hover:bg-transparent hover:text-gray-400"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                    {item.badge && (
                      <Badge 
                        variant="ai" 
                        className="ml-2 opacity-60"
                      >
                        {item.badge.text}
                        <Wand2 className="w-3 h-3 ml-1 text-purple-500" />
                      </Badge>
                    )}
                  </div>
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-100 text-gray-600">
              <p>Coming Soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <Button
        key={item.href}
        variant="ghost"
        className={`w-full justify-start ${
          pathname === item.href 
            ? "bg-gradient-to-l from-blue-300 to-blue-500 text-white" 
            : "hover:bg-gradient-to-l hover:from-blue-300 hover:to-blue-500 hover:text-white"
        }`}
        asChild
        onClick={handleNavigation}
      >
        <Link href={item.href} className="flex items-center">
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
          {item.badge && (
            <Badge 
              variant="ai" 
              className={`ml-2 ${
                pathname === item.href ? "border-white text-white" : ""
              }`}
            >
              {item.badge.text}
              <Wand2 
                className={`w-3 h-3 ml-1 ${
                  pathname === item.href ? "text-white" : "text-purple-500"
                }`} 
              />
            </Badge>
          )}
        </Link>
      </Button>
    )
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
          <Link href="/dashboard" className="text-2xl font-bold mb-2" onClick={handleNavigation}>
            TeamDesk
          </Link>
          {orgName && (
            <div className="flex items-center justify-between mb-6 px-1">
              <p className="text-sm text-gray-600">{orgName}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 h-auto hover:bg-gray-200" 
                onClick={() => {
                  router.push('/dashboard/settings');
                  handleNavigation();
                }}
              >
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="sr-only">Organization Settings</span>
              </Button>
            </div>
          )}
          
          {/* Upgrade to Premium Button - Only show for free plan */}
          {orgPlanType === 'free' && (
            <div className="mb-6 flex justify-center">
              <Button 
                variant="outline"
                className="bg-transparent border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-600 hover:text-yellow-700 px-4 py-2"
                onClick={() => {
                  router.push('/pricing');
                  handleNavigation();
                }}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Button>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${
                  pathname === "/dashboard" ? "bg-gradient-to-l from-blue-300 to-blue-500 text-white" : "hover:bg-gradient-to-l hover:from-blue-300 hover:to-blue-500 hover:text-white"
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
                  <section.icon className="h-4 w-4 mr-2 text-blue-600" />
                  <p className="text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
                    {section.label}
                  </p>
                </div>
                <div className="pl-2">
                  {section.items.map((item) => renderNavItem(item))}
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

