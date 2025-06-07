"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ConsultantLevelDefinition } from '@/types'

interface OrganizationContextType {
  levels: ConsultantLevelDefinition[]
  refreshLevels: () => Promise<void>
  isLoading: boolean
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [levels, setLevels] = useState<ConsultantLevelDefinition[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshLevels = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/organization/levels')
      if (response.ok) {
        const data = await response.json()
        setLevels(data.levels || [])
      } else {
        // Fallback to default levels if API fails
        setLevels([
          { id: 'junior', name: 'Junior', order: 1, isActive: true },
          { id: 'manager', name: 'Manager', order: 2, isActive: true },
          { id: 'partner', name: 'Partner', order: 3, isActive: true }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch organization levels:', error)
      // Fallback to default levels
      setLevels([
        { id: 'junior', name: 'Junior', order: 1, isActive: true },
        { id: 'manager', name: 'Manager', order: 2, isActive: true },
        { id: 'partner', name: 'Partner', order: 3, isActive: true }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshLevels()
  }, [])

  return (
    <OrganizationContext.Provider value={{ levels, refreshLevels, isLoading }}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganizationLevels() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganizationLevels must be used within an OrganizationProvider')
  }
  return context
} 