import { useEffect, useMemo } from 'react'
import { useCurrencyStore } from '@/store/currencyStore'
import { formatCurrency } from '@/utils/currencyConverter'
import { Transaction } from '@/models/transaction'

/**
 * Create a unique key for a transaction
 */
function getTransactionKey(transaction: Transaction): string {
  return `${transaction.date}-${transaction.itemName}-${transaction.originalAmount}-${transaction.currency}`
}

/**
 * Hook to convert transactions' original amounts to GBP using global currency store
 */
export function useCurrencyConversion(transactions: Transaction[]) {
  const rates = useCurrencyStore(state => state.rates)
  const isLoading = useCurrencyStore(state => state.isLoading)
  const fetchRates = useCurrencyStore(state => state.fetchRates)
  const convertToGBP = useCurrencyStore(state => state.convertToGBP)

  // Extract unique currencies from transactions
  const currencies = useMemo(() => {
    return [...new Set(transactions.map(t => t.currency))]
  }, [transactions])

  // Fetch rates for currencies we need (only currencies used in transactions)
  // Store will check and skip currencies that are already fetched (e.g., USD, TWD from App.tsx)
  useEffect(() => {
    if (currencies.length > 0) {
      fetchRates(currencies)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currencies.join(',')]) // Use string join to avoid object reference issues

  // Convert all transactions using the store
  const convertedAmounts = useMemo(() => {
    const amountMap = new Map<string, number>()
    transactions.forEach(t => {
      const key = getTransactionKey(t)
      // Convert using store
      const converted = convertToGBP(t.originalAmount, t.currency)
      amountMap.set(key, converted)
    })
    return amountMap
  }, [transactions, rates, convertToGBP])

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

