import { useState, useMemo, useEffect, useRef } from 'react'
import { loadTransactions } from '@/data/loadData'
import { Transaction } from '@/models/transaction'
import { DateFilter, filterTransactionsByDate, getAvailableYears, getAvailableMonths } from '@/utils/dateFilter'
import { calculateOverview } from '@/models/overview'
import TransactionFilters from '@/components/TransactionFilters'
import TransactionOverview from '@/components/TransactionOverview'
import TransactionTable from '@/components/TransactionTable'
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion'

export default function Transactions() {
  const allTransactions = useMemo(() => loadTransactions(), [])
  const availableYears = useMemo(() => getAvailableYears(allTransactions), [allTransactions])

  // 預設為當月
  const getDefaultFilter = (): DateFilter => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    return {
      type: 'month',
      year: currentYear,
      month: currentMonth,
    }
  }

  const [dateFilter, setDateFilter] = useState<DateFilter>(getDefaultFilter())
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const hasInitialized = useRef(false)

  // 當 availableYears 載入後，檢查並調整初始 dateFilter（只執行一次）
  useEffect(() => {
    if (!hasInitialized.current && availableYears.length > 0 && dateFilter.type === 'month') {
      hasInitialized.current = true
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1

      // 如果當前年份不在可用年份中，使用第一個可用年份的第一個可用月份
      if (!availableYears.includes(currentYear)) {
        const months = getAvailableMonths(allTransactions, availableYears[0])
        if (months.length > 0) {
          setDateFilter({
            type: 'month',
            year: availableYears[0],
            month: months[0],
          })
        }
      } else {
        // 檢查當前月份是否在可用月份中
        const months = getAvailableMonths(allTransactions, currentYear)
        if (months.length > 0 && !months.includes(currentMonth)) {
          // 如果當前月份不在可用月份中，使用第一個可用月份
          setDateFilter({
            type: 'month',
            year: currentYear,
            month: months[0],
          })
        }
      }
    }
  }, [availableYears, allTransactions, dateFilter.type])

  // Filter by date only (for overview)
  const dateFilteredTransactions = useMemo(() => {
    return allTransactions.filter((t: Transaction) => filterTransactionsByDate(t, dateFilter))
  }, [allTransactions, dateFilter])

  // Filter by date and category (for table)
  const filteredTransactions = useMemo(() => {
    let transactions = dateFilteredTransactions
    // Filter by category if selected
    if (selectedCategory) {
      transactions = transactions.filter((t: Transaction) => t.category === selectedCategory)
    }
    return transactions
  }, [dateFilteredTransactions, selectedCategory])

  // Convert currencies for all transactions (single hook call)
  const { getConvertedAmount, isLoading: isConverting } = useCurrencyConversion(allTransactions)
  
  // Create transactions with converted amounts for overview
  // Apply Share logic after conversion: if Share is true (share > 0), divide by 2
  const convertedTransactionsForOverview = useMemo(() => {
    if (isConverting) return []
    return dateFilteredTransactions.map(t => {
      const convertedAmount = getConvertedAmount(t)
      // Apply Share logic: Share = true means divide by 2 (比例 0.5)
      const finalAmount = t.share > 0 ? convertedAmount / 2 : convertedAmount
      return {
        ...t,
        finalAmount,
      }
    })
  }, [dateFilteredTransactions, getConvertedAmount, isConverting])

  // Also convert all transactions for category collection
  const convertedAllTransactions = useMemo(() => {
    if (isConverting) return []
    return allTransactions.map(t => {
      const convertedAmount = getConvertedAmount(t)
      // Apply Share logic: Share = true means divide by 2
      const finalAmount = t.share > 0 ? convertedAmount / 2 : convertedAmount
      return {
        ...t,
        finalAmount,
      }
    })
  }, [allTransactions, getConvertedAmount, isConverting])

  const overview = useMemo(() => {
    if (isConverting || convertedTransactionsForOverview.length === 0) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        categoryBreakdown: [],
      }
    }
    return calculateOverview(convertedTransactionsForOverview, convertedAllTransactions)
  }, [convertedTransactionsForOverview, convertedAllTransactions, isConverting])

  const handleFilterChange = (filter: DateFilter) => {
    setDateFilter(filter)
  }

  return (
    <div>
      <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
        <h1 className='text-3xl font-bold tracking-tight'>Transactions</h1>
        <TransactionFilters
          filter={dateFilter}
          availableYears={availableYears}
          allTransactions={allTransactions}
          onFilterChange={handleFilterChange}
        />
      </div>

      <div className='mb-6'>
        <TransactionOverview
          overview={overview}
          selectedCategory={selectedCategory}
          onCategoryClick={category => {
            // Toggle: if clicking the same category, deselect it
            setSelectedCategory(prev => (prev === category ? null : category))
          }}
        />
      </div>

      <div>
        <TransactionTable transactions={filteredTransactions} />
      </div>
    </div>
  )
}
