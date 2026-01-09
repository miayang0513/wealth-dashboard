/**
 * Currency Converter Utilities
 * Note: Exchange rate fetching is now handled by the global currency store
 * This file only contains formatting utilities
 */

const TARGET_CURRENCY = 'GBP'

/**
 * Format currency amount with currency symbol
 * Format: £ 123.45 (symbol first, then number with space)
 */
export function formatCurrency(amount: number, currency: string = TARGET_CURRENCY): string {
  const numberFormat = new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  
  const formattedNumber = numberFormat.format(Math.abs(amount))
  const sign = amount >= 0 ? '' : '-'
  
  // Get currency symbol
  const currencySymbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
    TWD: 'NT$',
  }
  
  const symbol = currencySymbols[currency] || currency
  
  // Format: symbol space sign number (e.g., "£ -123.45" or "£ 123.45")
  return `${symbol} ${sign}${formattedNumber}`
}

