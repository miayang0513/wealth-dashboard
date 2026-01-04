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
    try {
      // 使用 date-fns 的 parse 函數正確解析日期
      const transactionDate = parse(t.date, 'yyyy-MM-dd HH:mm:ss', new Date())
      // 檢查日期是否有效（不是 Invalid Date）
      if (!isNaN(transactionDate.getTime())) {
        const year = transactionDate.getFullYear()
        // 只添加合理的年份（例如 2000-2100）
        if (year >= 2000 && year <= 2100) {
          years.add(year)
        }
      }
    } catch (error) {
      // 如果解析失敗，跳過該筆交易
      console.warn('Failed to parse date:', t.date, error)
    }
  })
  return Array.from(years).sort((a, b) => b - a)
}

/**
 * 取得特定年份中可用的月份列表
 */
export function getAvailableMonths(transactions: Transaction[], year: number): number[] {
  const months = new Set<number>()
  transactions.forEach(t => {
    const transactionDate = parse(t.date, 'yyyy-MM-dd HH:mm:ss', new Date())
    const transactionYear = transactionDate.getFullYear()
    if (transactionYear === year) {
      const month = transactionDate.getMonth() + 1 // getMonth() 返回 0-11，需要 +1
      months.add(month)
    }
  })
  return Array.from(months).sort((a, b) => a - b)
}
