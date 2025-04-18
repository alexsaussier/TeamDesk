"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PlusCircle, LucideIcon } from "lucide-react"
import { ButtonHTMLAttributes } from "react"

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  className?: string
  icon?: LucideIcon
  variant?: 'primary' | 'gray'
}

export function GradientButton({ 
  label, 
  className, 
  icon: Icon = PlusCircle,
  variant = 'primary',  // Default to primary if no variant provided
  ...props 
}: GradientButtonProps) {
  const gradientStyles = {
    primary: "from-blue-400 to-blue-700 hover:from-blue-600 hover:to-blue-800",
    gray: "from-gray-400 to-gray-700 hover:from-gray-500 hover:to-gray-800"
  }

  return (
    <Button
      className={cn(
        "bg-gradient-to-r text-white transition-all duration-200 shadow-md hover:shadow-lg",
        "text-[10px] sm:text-sm px-1.5 sm:px-4 py-0.5 sm:py-2",
        gradientStyles[variant],
        className
      )}
      {...props}
    >
      <Icon className="mr-1 sm:mr-2 h-2.5 w-2.5 sm:h-4 sm:w-4" />
      {label}
    </Button>
  )
}