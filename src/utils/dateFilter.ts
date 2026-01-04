import { Transaction } from '@/models/transaction'
import { parse, isWithinInterval, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns'

export type DateFilterType = 'year' | 'month' | 'custom'

export interface DateFilter {
  type: DateFilterType
  year?: number
  month?: number
  from?: Date
  to?: Date
}

/**
 * 根據 DateFilter 過濾交易
 */
export function filterTransactionsByDate(transaction: Transaction, filter: DateFilter): boolean {
  const transactionDate = parse(transaction.date, 'yyyy-MM-dd HH:mm:ss', new Date())

  switch (filter.type) {
    case 'year':
      if (filter.year === undefined) return true
      const yearStart = startOfYear(new Date(filter.year, 0, 1))
      const yearEnd = endOfYear(new Date(filter.year, 0, 1))
      return isWithinInterval(transactionDate, { start: yearStart, end: yearEnd })

    case 'month':
      if (filter.year === undefined || filter.month === undefined) return true
      const monthStart = startOfMonth(new Date(filter.year, filter.month - 1, 1))
      const monthEnd = endOfMonth(new Date(filter.year, filter.month - 1, 1))
      return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd })

    case 'custom':
      if (filter.from === undefined || filter.to === undefined) return true
      return isWithinInterval(transactionDate, { start: filter.from, end: filter.to })

    default:
      return true
  }
}

/**
 * 取得所有交易中的年份列表
 */
export function getAvailableYears(transactions: Transaction[]): number[] {
  const years = new Set<number>()
  transactions.forEach(t => {
    const year = parseInt(t.date.substring(0, 4), 10)
    if (!isNaN(year)) {
      years.add(year)
    }
  })
  return Array.from(years).sort((a, b) => b - a)
}
