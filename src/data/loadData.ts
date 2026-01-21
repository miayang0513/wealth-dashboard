import { loadTransactionsFromSupabase, isSupabaseAvailable } from './supabase'
import { getCachedTransactions, setCachedTransactions } from './supabaseCache'

/**
 * 載入交易資料
 * 策略：
 * 1. 如果 Supabase 可用，先檢查緩存
 * 2. 如果有有效緩存，立即返回緩存數據（快速）
 * 3. 同時在背景從 Supabase 更新數據
 * 4. 如果 Supabase 不可用，拋出錯誤（不再使用本地 JSON）
 */
export async function loadTransactions(): Promise<import('@/models/transaction').Transaction[]> {
  // 檢查 Supabase 是否可用
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY in .env')
  }

  // 先檢查緩存
  const cached = getCachedTransactions()
  
  if (cached) {
    // 有緩存，立即返回（快速）
    // 同時在背景更新（不阻塞 UI）
    loadTransactionsFromSupabase()
      .then(transactions => {
        setCachedTransactions(transactions)
        console.log('Background sync completed')
      })
      .catch(error => {
        console.error('Background sync failed:', error)
        // 背景同步失敗不影響已顯示的緩存數據
      })
    
    return cached
  }
  
  // 沒有緩存，從 Supabase 載入
  const transactions = await loadTransactionsFromSupabase()
  // 載入後保存到緩存
  setCachedTransactions(transactions)
  return transactions
}
