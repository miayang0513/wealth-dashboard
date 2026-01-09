import { useState, useEffect } from 'react'
import { getExchangeRates as fetchExchangeRates } from '@/utils/currencyConverter'

interface ExchangeRateDisplay {
  currency: string
  rate: number | null
  isLoading: boolean
}

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
 * Shows real-time exchange rates for currencies used in the application
 */
export default function ExchangeRates({ compact = false }: ExchangeRatesProps) {
  const [rates, setRates] = useState<ExchangeRateDisplay[]>([
    { currency: 'USD', rate: null, isLoading: true },
    { currency: 'TWD', rate: null, isLoading: true },
  ])

  useEffect(() => {
    let isMounted = true

    async function fetchRates() {
      const currencies = ['USD', 'TWD']
      
      try {
        const rateMap = await fetchExchangeRates(currencies)

        if (!isMounted) return

        setRates(
          currencies.map(currency => ({
            currency,
            rate: rateMap[currency] || null,
            isLoading: false,
          }))
        )
      } catch (error) {
        console.error('Error fetching exchange rates:', error)
        if (isMounted) {
          setRates(prev =>
            prev.map(r => ({
              ...r,
              isLoading: false,
            }))
          )
        }
      }
    }

    fetchRates()

    // Refresh rates every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const formatRate = (currency: string, rate: number | null, isLoading: boolean) => {
    if (isLoading) {
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
        {rates.map(({ currency, rate, isLoading }, index) => (
          <div key={currency} className='flex items-center gap-0.5'>
            <span className='text-muted-foreground'>
              {getCurrencySymbol(currency)}/£:
            </span>
            {formatRate(currency, rate, isLoading)}
            {index < rates.length - 1 && (
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
        {rates.map(({ currency, rate, isLoading }, index) => (
          <div key={currency} className='flex items-center gap-1'>
            <span className='text-muted-foreground'>
              {getCurrencySymbol(currency)}/£:
            </span>
            {formatRate(currency, rate, isLoading)}
            {index < rates.length - 1 && (
              <span className='mx-1 text-muted-foreground'> </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

