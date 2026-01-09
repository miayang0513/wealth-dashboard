/**
 * Currency Converter Service
 * Uses Frankfurter API (free, no API key required)
 * https://www.frankfurter.app/
 * API endpoint: https://api.frankfurter.dev
 */

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
const TARGET_CURRENCY = 'GBP'
const FRANKFURTER_API = 'https://api.frankfurter.dev'

interface ExchangeRateCache {
  rates: Record<string, number>
  timestamp: number
}

let rateCache: ExchangeRateCache | null = null

/**
 * Alternative API for currencies not supported by Frankfurter (e.g., TWD)
 * Uses exchangerate-api.com (free tier, no API key required for basic usage)
 */
async function fetchExchangeRateAlternative(fromCurrency: string): Promise<number | null> {
  if (fromCurrency === TARGET_CURRENCY) {
    return 1
  }

  try {
    // Try using exchangerate-api.com as fallback
    // This API supports more currencies including TWD
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
    
    if (!response.ok) {
      throw new Error(`Alternative API failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    const rate = data.rates?.[TARGET_CURRENCY]
    
    if (!rate) {
      throw new Error(`Exchange rate not found for ${fromCurrency} to ${TARGET_CURRENCY}`)
    }
    
    return rate as number
  } catch (error) {
    console.error(`Error fetching exchange rate from alternative API for ${fromCurrency}:`, error)
    return null
  }
}

/**
 * Fetch exchange rate from a specific currency to GBP
 */
async function fetchExchangeRate(fromCurrency: string): Promise<number | null> {
  if (fromCurrency === TARGET_CURRENCY) {
    return 1
  }

  try {
    const response = await fetch(`${FRANKFURTER_API}/latest?from=${fromCurrency}&to=${TARGET_CURRENCY}`)
    
    if (!response.ok) {
      // If Frankfurter doesn't support this currency, try alternative API
      if (response.status === 404 || response.status === 400) {
        console.warn(`Frankfurter API doesn't support ${fromCurrency}, trying alternative API`)
        return await fetchExchangeRateAlternative(fromCurrency)
      }
      throw new Error(`Failed to fetch exchange rate: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Frankfurter returns { amount: 1, base: "USD", date: "...", rates: { GBP: 0.8 } }
    // The rate is already the conversion rate from fromCurrency to GBP
    const rate = data.rates?.[TARGET_CURRENCY]
    
    if (!rate) {
      // Try alternative API if rate not found
      return await fetchExchangeRateAlternative(fromCurrency)
    }
    
    return rate as number
  } catch (error) {
    console.error(`Error fetching exchange rate for ${fromCurrency}:`, error)
    // Try alternative API as fallback
    return await fetchExchangeRateAlternative(fromCurrency)
  }
}

/**
 * Fetch exchange rates from Frankfurter API for multiple currencies
 * Uses batch fetching to get rates for all unique currencies
 */
async function fetchExchangeRates(currencies: string[]): Promise<Record<string, number>> {
  const rates: Record<string, number> = {}
  const uniqueCurrencies = [...new Set(currencies)]
  
  // GBP to GBP is always 1
  rates[TARGET_CURRENCY] = 1
  
  // Fetch rates for all unique currencies in parallel
  const ratePromises = uniqueCurrencies
    .filter(c => c !== TARGET_CURRENCY)
    .map(async (currency) => {
      const rate = await fetchExchangeRate(currency)
      return { currency, rate }
    })
  
  const results = await Promise.all(ratePromises)
  
  results.forEach(({ currency, rate }) => {
    if (rate !== null) {
      rates[currency] = rate
    }
  })
  
  return rates
}

/**
 * Get exchange rates with caching
 * @param currencies Array of currency codes to fetch rates for
 */
export async function getExchangeRates(currencies: string[]): Promise<Record<string, number>> {
  const now = Date.now()
  
  // Check if cache is valid and contains all needed currencies
  const cached = rateCache
  if (cached !== null && now - cached.timestamp < CACHE_DURATION) {
    const hasAllCurrencies = currencies.every(c => c in cached.rates)
    if (hasAllCurrencies) {
      return cached.rates
    }
  }
  
  // Fetch new rates for the currencies we need
  const rates = await fetchExchangeRates(currencies)
  
  // Update cache (merge with existing rates if any)
  const existingRates = rateCache?.rates ?? {}
  rateCache = {
    rates: { ...existingRates, ...rates },
    timestamp: now,
  }
  
  return rates
}

/**
 * Convert amount from source currency to GBP
 * @param amount Original amount
 * @param fromCurrency Source currency code
 * @returns Converted amount in GBP
 */
export async function convertToGBP(amount: number, fromCurrency: string): Promise<number> {
  // If already GBP, return as is
  if (fromCurrency === TARGET_CURRENCY) {
    return amount
  }
  
  try {
    const rates = await getExchangeRates([fromCurrency])
    const rate = rates[fromCurrency]
    
    if (!rate) {
      console.warn(`Exchange rate not found for ${fromCurrency}, returning original amount`)
      return amount
    }
  
    return amount * rate
  } catch (error) {
    console.error(`Error converting ${fromCurrency} to ${TARGET_CURRENCY}:`, error)
    return amount
  }
}

/**
 * Convert multiple amounts in batch (more efficient)
 * @param amounts Array of { amount, currency } objects
 * @returns Array of converted amounts in GBP
 */
export async function convertMultipleToGBP(
  amounts: Array<{ amount: number; currency: string }>
): Promise<number[]> {
  // Extract unique currencies
  const currencies = [...new Set(amounts.map(a => a.currency))]
  
  // Get exchange rates for all currencies
  const rates = await getExchangeRates(currencies)
  
  return amounts.map(({ amount, currency }) => {
    if (currency === TARGET_CURRENCY) {
      return amount
    }
    
    const rate = rates[currency]
    if (!rate) {
      console.warn(`Exchange rate not found for ${currency}, returning original amount`)
      return amount
    }
    
    return amount * rate
  })
}

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

