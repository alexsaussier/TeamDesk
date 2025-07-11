type Currency = 'USD' | 'EUR' | 'GBP'

export const getCurrencySymbol = (currency: Currency): string => {
  switch (currency) {
    case 'USD': return '$'
    case 'EUR': return '€'
    case 'GBP': return '£'
    default: return '$'
  }
}

export const formatCurrency = (
  amount: number, 
  currency: Currency, 
  options: { showSymbol?: boolean, decimalPlaces?: number } = {}
): string => {
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

export const formatCurrencySimple = (amount: number, currency: Currency): string => {
  const symbol = getCurrencySymbol(currency)
  return `${symbol}${amount.toLocaleString()}`
}

export const formatHourlyRate = (rate: number, currency: Currency): string => {
  const symbol = getCurrencySymbol(currency)
  return `${symbol}${rate}/hr`
} 