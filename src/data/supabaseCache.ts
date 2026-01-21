import { Transaction } from '@/models/transaction'

const CACHE_KEY = 'supabase_transactions_cache'
const CACHE_TIMESTAMP_KEY = 'supabase_transactions_cache_timestamp'
const CACHE_DURATION = 1000 * 60 * 60 // 1 小時緩存時間

interface CacheData {
  transactions: Transaction[]
  timestamp: number
}

/**
 * 從緩存讀取數據
 */
export function getCachedTransactions(): Transaction[] | null {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY)
    const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)

    if (!cachedData || !cachedTimestamp) {
      return null
    }

    const timestamp = parseInt(cachedTimestamp, 10)
    const now = Date.now()

    // 檢查緩存是否過期
    if (now - timestamp > CACHE_DURATION) {
      console.log('Cache expired, will fetch from Supabase')
      return null
    }

    const data: CacheData = JSON.parse(cachedData)
    console.log(`Using cached data (${data.transactions.length} transactions, cached ${Math.floor((now - timestamp) / 1000 / 60)} minutes ago)`)
    return data.transactions
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
}

/**
 * 保存數據到緩存
 */
export function setCachedTransactions(transactions: Transaction[]): void {
  try {
    const cacheData: CacheData = {
      transactions,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    localStorage.setItem(CACHE_TIMESTAMP_KEY, cacheData.timestamp.toString())
    console.log(`Cached ${transactions.length} transactions`)
  } catch (error) {
    console.error('Error saving cache:', error)
    // 如果 localStorage 空間不足，嘗試清理舊緩存
    try {
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(CACHE_TIMESTAMP_KEY)
      localStorage.setItem(CACHE_KEY, JSON.stringify({ transactions, timestamp: Date.now() }))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
    } catch (retryError) {
      console.error('Failed to save cache even after cleanup:', retryError)
    }
  }
}

/**
 * 清除緩存
 */
export function clearCache(): void {
  localStorage.removeItem(CACHE_KEY)
  localStorage.removeItem(CACHE_TIMESTAMP_KEY)
  console.log('Cache cleared')
}

/**
 * 檢查緩存是否存在且有效
 */
export function isCacheValid(): boolean {
  const cached = getCachedTransactions()
  return cached !== null
}

