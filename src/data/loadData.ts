import { AccountingJsonSchema, transformAccountingDataToTransactions } from '@/models/transaction'
import accountingData from '../../Accounting.json'

/**
 * 載入並驗證 Accounting.json 資料
 */
export function loadTransactions() {
  // 驗證資料結構
  const validatedData = AccountingJsonSchema.parse(accountingData)

  // 轉換為 Canonical Schema
  return transformAccountingDataToTransactions(validatedData)
}
