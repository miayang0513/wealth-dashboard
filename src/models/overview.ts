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
  // Daily Expense
  'Eating Out',
  'Groceries',
  'Transportation',
  'Shopping',
  'Necessity',
  'Entertainment',
  'Exercise',
  'Productivity',
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
 * 定義收入類別（只有這些類別會被計算為收入）
 */
const INCOME_CATEGORIES = ['Salary', 'OtherIncomes']

/**
 * 判斷是否為收入類別
 */
function isIncomeCategory(category: string): boolean {
  return INCOME_CATEGORIES.includes(category)
}

/**
 * 計算 Overview 資料
 * 正數為支出（expense），負數為收入（income）
 * 
 * 收入規則：
 * - 只有 Salary 和 OtherIncomes 類別且 finalAmount < 0 的交易才被計算為收入
 * 
 * 支出規則：
 * - 所有 finalAmount > 0 的交易
 * - 所有 finalAmount < 0 但不是 Salary 或 OtherIncomes 的交易（取絕對值，與支出抵銷）
 * 
 * @param transactions 當前 filter 下的交易（用於計算金額）
 * @param allTransactions 所有交易（用於收集所有出現過的類別，確保統一顯示）
 */
export function calculateOverview(transactions: Transaction[], allTransactions?: Transaction[]): Overview {
  // 收入：只有 Salary 和 OtherIncomes 類別且 finalAmount < 0 的交易
  const income = transactions
    .filter(t => {
      const isIncome = getTransactionType(t) === 'income'
      return isIncome && isIncomeCategory(t.category)
    })
    .reduce((sum, t) => sum + Math.abs(t.finalAmount), 0)

  // 支出：
  // 1. 所有 finalAmount > 0 的交易（真正的支出）
  // 2. 所有 finalAmount < 0 但不是 Salary 或 OtherIncomes 的交易（從支出中抵銷，即減去）
  const positiveExpenses = transactions
    .filter(t => t.finalAmount > 0)
    .reduce((sum, t) => sum + t.finalAmount, 0)
  
  const offsetAmount = transactions
    .filter(t => t.finalAmount < 0 && !isIncomeCategory(t.category))
    .reduce((sum, t) => sum + Math.abs(t.finalAmount), 0)
  
  const expenses = positiveExpenses - offsetAmount

  // Category breakdown 計算每個類別的支出（考慮抵銷）
  // 對於每個類別：支出金額 = 該類別的正數支出 - 該類別的抵銷收入
  const categoryExpenseMap = new Map<string, number>() // 正數支出
  const categoryOffsetMap = new Map<string, number>() // 抵銷收入
  
  transactions.forEach(t => {
    if (t.finalAmount > 0) {
      // 正數支出
      const current = categoryExpenseMap.get(t.category) || 0
      categoryExpenseMap.set(t.category, current + t.finalAmount)
    } else if (t.finalAmount < 0 && !isIncomeCategory(t.category)) {
      // 抵銷收入（負數但不是收入類別）
      const current = categoryOffsetMap.get(t.category) || 0
      categoryOffsetMap.set(t.category, current + Math.abs(t.finalAmount))
    }
  })
  
  // 計算每個類別的最終金額（支出 - 抵銷）
  // 收集所有在整個數據中出現過的類別（用於統一顯示，即使當前 filter 下金額為 0 也要顯示）
  // 優先使用 allTransactions，如果沒有則使用 transactions
  const allCategoriesInData = allTransactions && allTransactions.length > 0 ? allTransactions : transactions
  const allCategoriesSet = new Set<string>()
  
  // 從所有交易中收集所有出現過的類別（排除收入類別）
  allCategoriesInData.forEach(t => {
    if (!isIncomeCategory(t.category)) {
      allCategoriesSet.add(t.category)
    }
  })
  
  // 合併當前 filter 下的類別和所有數據中的類別
  // 確保所有在數據中出現過的類別都被包含，即使當前 filter 下沒有該類別的交易
  const allCategories = new Set([
    ...allCategoriesSet,
    ...categoryExpenseMap.keys(),
    ...categoryOffsetMap.keys(),
  ])
  
  const categoryMap = new Map<string, number>()
  allCategories.forEach(category => {
    const expense = categoryExpenseMap.get(category) || 0
    const offset = categoryOffsetMap.get(category) || 0
    const netAmount = expense - offset
    // 顯示所有在數據中出現過的類別，包括金額為 0 的
    categoryMap.set(category, netAmount)
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
