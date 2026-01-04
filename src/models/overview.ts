import { Transaction, getTransactionType } from './transaction'

/**
 * Overview 為 derived data，不存成資料模型
 * 根據過濾後的交易資料即時計算
 */
export interface Overview {
  totalIncome: number
  totalExpense: number
  categoryBreakdown: CategoryBreakdown[]
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
}

/**
 * 計算 Overview 資料
 * 正數為支出（expense），負數為收入（income）
 */
export function calculateOverview(transactions: Transaction[]): Overview {
  // 收入：finalAmount < 0，取絕對值累加
  const income = transactions
    .filter(t => getTransactionType(t) === 'income')
    .reduce((sum, t) => sum + Math.abs(t.finalAmount), 0)

  // 支出：finalAmount > 0，直接累加
  const expenses = transactions
    .filter(t => getTransactionType(t) === 'expense')
    .reduce((sum, t) => sum + t.finalAmount, 0)

  // Category breakdown 只計算 expense
  const categoryMap = new Map<string, number>()
  transactions
    .filter(t => getTransactionType(t) === 'expense')
    .forEach(t => {
      const current = categoryMap.get(t.category) || 0
      categoryMap.set(t.category, current + t.finalAmount)
    })

  const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: expenses > 0 ? (amount / expenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  return {
    totalIncome: income,
    totalExpense: expenses,
    categoryBreakdown,
  }
}
