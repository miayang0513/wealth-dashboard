import { useState, useEffect, useMemo } from 'react'
import { convertMultipleToGBP, formatCurrency } from '@/utils/currencyConverter'
import { Transaction } from '@/models/transaction'

/**
 * Create a unique key for a transaction
 */
function getTransactionKey(transaction: Transaction): string {
  return `${transaction.date}-${transaction.itemName}-${transaction.originalAmount}-${transaction.currency}`
}

/**
 * Hook to convert transactions' original amounts to GBP using real-time exchange rates
 */
export function useCurrencyConversion(transactions: Transaction[]) {
  const [convertedAmounts, setConvertedAmounts] = useState<Map<string, number>>(new Map())
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    let isMounted = true

    async function convertAmounts() {
      setIsLoading(true)
      
      try {
        // Prepare amounts for batch conversion
        const amountsToConvert = transactions.map(t => ({
          amount: Math.abs(t.originalAmount),
          currency: t.currency,
        }))

        // Convert all amounts in batch
        const converted = await convertMultipleToGBP(amountsToConvert)

        if (!isMounted) return

        // Create a map of transaction key to converted amount
        const amountMap = new Map<string, number>()
        transactions.forEach((t, i) => {
          const key = getTransactionKey(t)
          // Preserve the sign of original amount
          const sign = t.originalAmount >= 0 ? 1 : -1
          amountMap.set(key, converted[i] * sign)
        })

        setConvertedAmounts(amountMap)
      } catch (error) {
        console.error('Error converting currencies:', error)
        // Fallback to original amounts
        const fallbackMap = new Map<string, number>()
        transactions.forEach(t => {
          const key = getTransactionKey(t)
          fallbackMap.set(key, t.originalAmount)
        })
        setConvertedAmounts(fallbackMap)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    convertAmounts()

    return () => {
      isMounted = false
    }
  }, [transactions])

  /**
   * Get converted amount for a transaction
   */
  const getConvertedAmount = (transaction: Transaction): number => {
    const key = getTransactionKey(transaction)
    return convertedAmounts.get(key) ?? transaction.originalAmount
  }

  /**
   * Format converted amount with GBP symbol
   */
  const formatConvertedAmount = (transaction: Transaction): string => {
    const amount = getConvertedAmount(transaction)
    return formatCurrency(Math.abs(amount), 'GBP')
  }

  return {
    convertedAmounts,
    isLoading,
    getConvertedAmount,
    formatConvertedAmount,
  }
}

