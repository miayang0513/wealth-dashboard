import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 載入 .env 文件
config({ path: join(__dirname, '..', '.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set')
  console.error('Usage: Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 讀取 Accounting.json
const accountingDataPath = join(__dirname, '..', 'Accounting.json')
const accountingData = JSON.parse(readFileSync(accountingDataPath, 'utf-8'))

/**
 * 將 boolean 或 number 轉換為 number
 */
function toNumber(value: number | boolean): number {
  if (typeof value === 'boolean') {
    return value ? 1 : 0
  }
  return value
}

/**
 * 將日期字串轉換為 ISO 格式
 */
function parseDate(dateStr: string): string {
  // 格式: "YYYY-MM-DD HH:MM:SS" -> "YYYY-MM-DDTHH:mm:ss"
  if (dateStr.includes(' ')) {
    return dateStr.replace(' ', 'T')
  }
  return `${dateStr}T00:00:00`
}

/**
 * 轉換為 Supabase 格式
 */
function transformToSupabaseFormat(row: any) {
  return {
    date: parseDate(row.Date),
    item_name: row.ItemName || '',
    category: row.Category || 'Other',
    original_amount: row.OriginalAmount ?? 0,
    final_amount: row.FinalAmount ?? row.OriginalAmount ?? 0,
    currency: row.Currency || 'USD',
    share: toNumber(row.Share),
    exclude: toNumber(row.Exclude),
    gf: toNumber(row.Gf),
    girl_friend_percentage: row.girlFriendPercentage ?? 0,
    trip: row.Trip ?? false,
  }
}

/**
 * 主匯入函數
 */
async function importAllTransactions(limit?: number) {
  console.log('Starting import to Supabase...')
  console.log(`Supabase URL: ${SUPABASE_URL}`)
  console.log('')

  const allRows: any[] = []
  for (const monthData of Object.values(accountingData)) {
    allRows.push(...(monthData as any).Data)
  }

  // 如果指定了限制，只取前 N 筆
  const rowsToImport = limit ? allRows.slice(0, limit) : allRows

  console.log(`Total transactions in file: ${allRows.length}`)
  if (limit) {
    console.log(`Importing first ${limit} transactions (test mode)`)
  } else {
    console.log(`Importing all ${rowsToImport.length} transactions`)
  }
  console.log('')

  let successCount = 0
  let errorCount = 0

  // Supabase 支援批量插入，每次最多 1000 筆
  const batchSize = 500 // 使用 500 筆一批，較安全
  const totalBatches = Math.ceil(rowsToImport.length / batchSize)

  for (let i = 0; i < rowsToImport.length; i += batchSize) {
    const batch = rowsToImport.slice(i, i + batchSize)
    const batchNumber = Math.floor(i / batchSize) + 1

    try {
      // 轉換為 Supabase 格式
      const supabaseData = batch.map(transformToSupabaseFormat)

      // 批量插入
      const { data, error } = await supabase.from('transactions').insert(supabaseData)

      if (error) {
        // 如果遇到錯誤，逐筆插入以找出問題
        console.log(`   Batch ${batchNumber}: Error in batch insert, trying one by one...`)
        for (const row of supabaseData) {
          try {
            const { error: insertError } = await supabase.from('transactions').insert(row)
            if (insertError) {
              // 不再跳過重複，而是記錄錯誤
              errorCount++
              console.error(`   Error inserting "${row.item_name}": ${insertError.message}`)
            } else {
              successCount++
            }
          } catch (err: any) {
            errorCount++
            console.error(`   Error: ${err.message || err}`)
          }
        }
      } else {
        successCount += batch.length
      }

      // 顯示進度
      const progress = ((i + batch.length) / rowsToImport.length) * 100
      console.log(
        `Progress: ${Math.round(progress)}% (${i + batch.length}/${rowsToImport.length}) | Success: ${successCount} | Errors: ${errorCount} | Batch ${batchNumber}/${totalBatches}`
      )
    } catch (error: any) {
      errorCount += batch.length
      console.error(`Error in batch ${batchNumber}:`, error.message || error)
    }
  }

  console.log('')
  console.log('Import completed!')
  console.log(`Total in file: ${allRows.length}`)
  console.log(`Imported: ${rowsToImport.length}`)
  console.log(`Success: ${successCount}`)
  console.log(`Errors: ${errorCount}`)
}

// 檢查是否有測試模式參數
const testMode = process.argv.includes('--test') || process.argv.includes('-t')
const limitArg = process.argv.find(arg => arg.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : (testMode ? 5 : undefined)

if (testMode || limit) {
  console.log(`🧪 Test mode: Importing first ${limit || 5} transactions only`)
  console.log('   Use "pnpm import:supabase" without --test to import all transactions')
  console.log('')
}

// 執行匯入
importAllTransactions(limit).catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

