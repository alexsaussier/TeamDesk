"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Organization } from '@/types'

type Currency = 'USD' | 'EUR' | 'GBP'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatCurrency: (amount: number, options?: { showSymbol?: boolean, decimalPlaces?: number }) => string
  getCurrencySymbol: () => string
  loading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch organization data to get currency preference
    const fetchCurrency = async () => {
      try {
        const response = await fetch('/api/organization')
        if (response.ok) {
          const organization: Organization = await response.json()
          setCurrencyState(organization.currency || 'USD')
        }
      } catch (error) {
        console.error('Error fetching organization currency:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrency()
  }, [])

  const setCurrency = async (newCurrency: Currency) => {
    try {
      const response = await fetch('/api/organization', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currency: newCurrency }),
      })

      if (response.ok) {
        setCurrencyState(newCurrency)
      }
    } catch (error) {
      console.error('Error updating currency:', error)
    }
  }

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'GBP': return '£'
      default: return '$'
    }
  }

  const formatCurrency = (amount: number, options: { showSymbol?: boolean, decimalPlaces?: number } = {}) => {
    const { showSymbol = true, decimalPlaces = 0 } = options
    
    const localeMap = {
      USD: 'en-US',
      EUR: 'en-GB', // Using en-GB for EUR to avoid conflicts
      GBP: 'en-GB'
    }

    const currencyMap = {
      USD: 'USD',
      EUR: 'EUR', 
      GBP: 'GBP'
    }

    if (showSymbol) {
      return new Intl.NumberFormat(localeMap[currency], {
        style: 'currency',
        currency: currencyMap[currency],
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(amount)
    } else {
      return new Intl.NumberFormat(localeMap[currency], {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(amount)
    }
  }

  const value = {
    currency,
    setCurrency,
    formatCurrency,
    getCurrencySymbol,
    loading
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
} 