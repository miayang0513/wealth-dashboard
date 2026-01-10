import { create } from 'zustand'

const TARGET_CURRENCY = 'GBP'
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest'
const POLL_INTERVAL = 10 * 60 * 1000 // 5 minutes

interface ExchangeRates {
  [currency: string]: number
}

interface CurrencyStore {
  rates: ExchangeRates
  isLoading: boolean
  lastUpdated: number | null
  error: string | null
  fetchRates: (currencies: string[]) => Promise<void>
  getRate: (currency: string) => number | null
  convertToGBP: (amount: number, fromCurrency: string) => number
}

/**
 * Global currency exchange rate store
 * Fetches rates from exchangerate-api.com and polls every 5 minutes
 */
export const useCurrencyStore = create<CurrencyStore>((set, get) => {
  let pollInterval: NodeJS.Timeout | null = null
  const requestedCurrencies: Set<string> = new Set()
  // Track pending requests to prevent duplicate concurrent requests
  const pendingRequests: Map<string, Promise<number | null>> = new Map()

  const internalFetchRates = async (currencies: string[], forceRefresh = false): Promise<void> => {
    const uniqueCurrencies = [...new Set(currencies)].filter(c => c !== TARGET_CURRENCY)

    if (uniqueCurrencies.length === 0) {
      // Only GBP, no need to fetch
      // Don't reset rates - keep existing rates for display purposes
      set({ isLoading: false, error: null })
      return
    }

    // Track all requested currencies for polling
    uniqueCurrencies.forEach(c => requestedCurrencies.add(c))

    // Check which currencies we actually need to fetch
    const currentRates = get().rates
    const currenciesToFetch: string[] = []
    const pendingPromises: Promise<number | null>[] = []

    uniqueCurrencies.forEach(currency => {
      // If forceRefresh is true (during polling), always fetch even if we have the rate
      if (!forceRefresh && currency in currentRates) {
        // Already have the rate, skip (unless force refresh)
        return
      }

      if (pendingRequests.has(currency)) {
        // Already requesting, wait for existing request
        pendingPromises.push(pendingRequests.get(currency)!)
        return
      }

      // Need to fetch this currency
      currenciesToFetch.push(currency)
    })

    // If all currencies are already available or pending, just wait for pending requests
    if (currenciesToFetch.length === 0) {
      if (pendingPromises.length > 0) {
        await Promise.all(pendingPromises)
      }
      return
    }

    // Only set isLoading during initial load, not during polling (forceRefresh)
    // This prevents UI flickering during background updates
    if (!forceRefresh) {
      set({ isLoading: true, error: null })
    }

    try {
      // Fetch rates for each currency that we don't have yet
      // Use pending requests map to prevent duplicate concurrent requests
      const ratePromises = currenciesToFetch.map(async currency => {
        // Create a single request promise per currency
        const requestPromise = (async () => {
          try {
            const response = await fetch(`${EXCHANGE_RATE_API}/${currency}`)

            if (!response.ok) {
              throw new Error(`Failed to fetch rate for ${currency}: ${response.statusText}`)
            }

            const data = await response.json()
            const rate = data.rates?.[TARGET_CURRENCY]

            if (!rate) {
              throw new Error(`Rate not found for ${currency} to ${TARGET_CURRENCY}`)
            }

            return rate as number
          } catch (error) {
            console.error(`Error fetching rate for ${currency}:`, error)
            return null
          } finally {
            // Remove from pending requests when done
            pendingRequests.delete(currency)
          }
        })()

        // Store the promise to prevent duplicate requests
        pendingRequests.set(currency, requestPromise)

        const rate = await requestPromise
        return { currency, rate }
      })

      const results = await Promise.all(ratePromises)

      // Update rates
      const newRates: ExchangeRates = { [TARGET_CURRENCY]: 1 }
      results.forEach(({ currency, rate }) => {
        if (rate !== null) {
          newRates[currency] = rate
        }
      })

      // Merge with existing rates
      const currentRates = get().rates
      const stateUpdate: Partial<CurrencyStore> = {
        rates: { ...currentRates, ...newRates },
        lastUpdated: Date.now(),
        error: null,
      }

      // Only update isLoading if it was set (i.e., not during polling)
      if (!forceRefresh) {
        stateUpdate.isLoading = false
      }

      set(stateUpdate)
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch exchange rates',
      })
    }
  }

  // Start polling
  const startPolling = () => {
    // Clear existing interval if any
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }

    // Only start polling if we have currencies to track
    const currencies = Array.from(requestedCurrencies)
    if (currencies.length === 0) {
      return
    }

    pollInterval = setInterval(() => {
      const currenciesToPoll = Array.from(requestedCurrencies)
      if (currenciesToPoll.length > 0) {
        // Force refresh all tracked currencies during polling (forceRefresh = true)
        internalFetchRates(currenciesToPoll, true)
      }
    }, POLL_INTERVAL)
  }

  return {
    rates: { GBP: 1 },
    isLoading: false,
    lastUpdated: null,
    error: null,

    fetchRates: async (currencies: string[]) => {
      await internalFetchRates(currencies)
      // Start/restart polling after fetch (even if no new currencies were fetched)
      startPolling()
    },

    getRate: (currency: string): number | null => {
      const rates = get().rates
      return rates[currency] ?? null
    },

    convertToGBP: (amount: number, fromCurrency: string): number => {
      if (fromCurrency === TARGET_CURRENCY) {
        return amount
      }

      const rate = get().getRate(fromCurrency)
      
      // Return original amount if rate is not available (during loading or if fetch failed)
      // This is expected behavior and doesn't need a warning
      if (!rate) {
        return amount
      }

      return amount * rate
    },
  }
})
