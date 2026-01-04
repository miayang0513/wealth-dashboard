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
 * 定義固定的類別順序（按照圖片中的順序）
 */
const CATEGORY_ORDER: string[] = [
  // Rent & Bills
  'Rent',
  'Wi-Fi',
  'Energy',
  'Council Tax',
  'Water',
  'Council',
  // Daily Expense
  'Eating Out',
  'Groceries',
  'Transportation',
  'Shopping',
  'Necessity',
  'Entertainment',
  'Exercise',
  'Learning',
  'Subscription',
  'Subscription Service',
  'Others',
]

/**
 * 根據固定順序排序類別
 */
function sortCategoriesByOrder(categories: CategoryBreakdown[]): CategoryBreakdown[] {
  return categories.sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a.category)
    const indexB = CATEGORY_ORDER.indexOf(b.category)
    
    // 如果兩個類別都在順序列表中，按照順序排序
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }
    // 如果只有一個在順序列表中，優先顯示在列表中的
    if (indexA !== -1) return -1
    if (indexB !== -1) return 1
    // 如果都不在順序列表中，按字母順序排序
    return a.category.localeCompare(b.category)
  })
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

  // 按照固定順序排序
  const orderedCategoryBreakdown = sortCategoriesByOrder(categoryBreakdown)

  return {
    totalIncome: income,
    totalExpense: expenses,
    categoryBreakdown: orderedCategoryBreakdown,
  }
}
