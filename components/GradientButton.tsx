"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PlusCircle } from "lucide-react"
import { ButtonHTMLAttributes } from "react"

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  className?: string
}

export function GradientButton({ label, className, ...props }: GradientButtonProps) {
  return (
    <Button
      className={cn(
        "bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white transition-all duration-200 shadow-md hover:shadow-lg",
        className
      )}
      {...props}
    >
      <PlusCircle className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}