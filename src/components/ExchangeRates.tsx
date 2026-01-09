import { useCurrencyStore } from '@/store/currencyStore'

/**
 * Get currency symbol for display
 */
function getCurrencySymbol(currency: string): string {
  const currencySymbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
    TWD: 'NT$',
  }
  return currencySymbols[currency] || currency
}

interface ExchangeRatesProps {
  compact?: boolean
}

/**
 * Exchange Rates Display Component
 * Shows real-time exchange rates from global currency store
 */
export default function ExchangeRates({ compact = false }: ExchangeRatesProps) {
  const rates = useCurrencyStore(state => state.rates)
  const isLoading = useCurrencyStore(state => state.isLoading)
  
  // Currencies to display (rates will be fetched by App.tsx or useCurrencyConversion)
  const displayCurrencies = ['USD', 'TWD']

  const formatRate = (currency: string) => {
    const rate = rates[currency]
    // Only show loading if we don't have the rate yet (initial load)
    // Don't show loading during polling updates (when rate already exists)
    if (isLoading && !rate) {
      return <span className='text-muted-foreground animate-pulse'>...</span>
    }
    if (!rate) {
      return <span className='text-muted-foreground'>N/A</span>
    }
    return <span className='font-medium'>{rate.toFixed(4)}</span>
  }

  if (compact) {
    return (
      <div className='flex items-center justify-center gap-2 text-[10px]'>
        {displayCurrencies.map((currency, index) => (
          <div key={currency} className='flex items-center gap-0.5'>
            <span className='text-muted-foreground'>
              {getCurrencySymbol(currency)}/£:
            </span>
            {formatRate(currency)}
            {index < displayCurrencies.length - 1 && (
              <span className='mx-1 text-muted-foreground'> </span>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='flex items-center gap-2 sm:gap-4 text-xs'>
      <span className='text-muted-foreground hidden lg:inline'>Exchange Rates:</span>
      <div className='flex items-center gap-2 sm:gap-3'>
        {displayCurrencies.map((currency, index) => (
          <div key={currency} className='flex items-center gap-1'>
            <span className='text-muted-foreground'>
              {getCurrencySymbol(currency)}/£:
            </span>
            {formatRate(currency)}
            {index < displayCurrencies.length - 1 && (
              <span className='mx-1 text-muted-foreground'> </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

