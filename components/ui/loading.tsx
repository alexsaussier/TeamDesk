"use client"

import { Spinner } from "@/components/ui/spinner"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  fullPage?: boolean
}

export function Loading({ size = "md", text = "Loading...", fullPage = false }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4", 
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }
  
  const containerClasses = fullPage 
    ? "flex items-center justify-center min-h-[400px]" 
    : "flex items-center justify-center py-8"
  
  return (
    <div className={containerClasses}>
      <div className="text-center">
        <Spinner className={sizeClasses[size]} />
        {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  )
} 