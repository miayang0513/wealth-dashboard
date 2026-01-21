import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Transaction } from '@/models/transaction'
import { Database } from '@/lib/database.types'
import { requestDeduplicator } from '@/utils/requestDeduplicator'

/**
 * Supabase Client
 * 需要設定環境變數 VITE_SUPABASE_URL 和 VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
 * 
 * 注意：VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY 可以使用：
 * - 新的 Publishable key (推薦，格式: sb_publishable_...)
 * - 舊的 anon key (legacy，格式: eyJ...)
 */
let supabaseClient: SupabaseClient<Database> | null = null

function getSupabaseClient(): SupabaseClient<Database> | null {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY.')
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return supabaseClient
}

/**
 * 從 Supabase 載入所有交易記錄（內部實現）
 */
async function _loadTransactionsFromSupabase(): Promise<Transaction[]> {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error('Supabase client not available')
  }

  const transactions: Transaction[] = []
  let hasMore = true
  let page = 0
  const pageSize = 1000 // Supabase 單次查詢最多 1000 筆

  while (hasMore) {
    const { data, error } = await client
      .from('transactions')
      .select('*')
      .order('date', { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (error) {
      console.error('Error fetching from Supabase:', error)
      throw error
    }

    if (data && data.length > 0) {
      // 轉換資料格式
      // data 的類型現在是 Database['public']['Tables']['transactions']['Row'][]
      for (const row of data) {
        // 轉換日期格式：Supabase 返回 ISO 格式，轉換為我們的格式
        let dateStr = row.date
        if (dateStr && typeof dateStr === 'string' && dateStr.includes('T')) {
          dateStr = dateStr.replace('T', ' ').substring(0, 19)
        }
        
        transactions.push({
          date: dateStr || row.date,
          itemName: row.item_name,
          category: row.category,
          originalAmount: parseFloat(String(row.original_amount)) || 0,
          share: row.share ?? 0,
          finalAmount: row.final_amount ? parseFloat(String(row.final_amount)) : (parseFloat(String(row.original_amount)) || 0),
          exclude: row.exclude ?? 0,
          gf: row.gf ?? 0,
          girlFriendPercentage: parseFloat(String(row.girl_friend_percentage)) || 0,
          trip: row.trip ?? false,
          currency: row.currency || 'USD',
        })
      }

      hasMore = data.length === pageSize
      page++
    } else {
      hasMore = false
    }
  }

  return transactions
}

/**
 * 從 Supabase 載入所有交易記錄（帶防重複機制）
 */
export async function loadTransactionsFromSupabase(): Promise<Transaction[]> {
  return requestDeduplicator.execute('loadTransactionsFromSupabase', _loadTransactionsFromSupabase)
}

/**
 * 檢查 Supabase 是否可用
 */
export function isSupabaseAvailable(): boolean {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  return !!(supabaseUrl && supabaseAnonKey)
}

