import { z } from 'zod'

/**
 * Canonical Schema: Transaction Domain Model
 * 所有交易資料都必須符合此 schema
 */
export const TransactionSchema = z.object({
  date: z.string(), // ISO date string: "YYYY-MM-DD HH:MM:SS"
  itemName: z.string(),
  category: z.string(),
  originalAmount: z.number(),
  share: z.number(),
  finalAmount: z.number(),
  exclude: z.number(),
  gf: z.number(),
  girlFriendPercentage: z.number(),
  trip: z.boolean(),
})

export type Transaction = z.infer<typeof TransactionSchema>

/**
 * Transaction Type: income, expense, transfer
 */
export type TransactionType = 'income' | 'expense' | 'transfer'

/**
 * 判斷交易類型
 * 正數為支出（expense），負數為收入（income）
 */
export function getTransactionType(transaction: Transaction): TransactionType {
  if (transaction.finalAmount > 0) {
    return 'expense'
  }
  if (transaction.finalAmount < 0) {
    return 'income'
  }
  return 'transfer'
}

/**
 * 原始 Accounting.json 的資料結構
 * 注意：Share、Exclude、Gf 可能是 number 或 boolean
 */
export const AccountingDataSchema = z.object({
  Columns: z.array(z.string()),
  RowCount: z.number(),
  Data: z.array(
    z.object({
      Date: z.string(),
      ItemName: z.string(),
      Category: z.string(),
      OriginalAmount: z.number(),
      Share: z.union([z.number(), z.boolean()]),
      FinalAmount: z.number(),
      Exclude: z.union([z.number(), z.boolean()]),
      Gf: z.union([z.number(), z.boolean()]),
      girlFriendPercentage: z.number(),
      Trip: z.boolean(),
    })
  ),
})

export type AccountingData = z.infer<typeof AccountingDataSchema>

export const AccountingJsonSchema = z.record(z.string(), AccountingDataSchema)

export type AccountingJson = z.infer<typeof AccountingJsonSchema>

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
 * 將原始 Accounting.json 資料轉換為 Canonical Schema
 */
export function transformAccountingDataToTransactions(accountingData: AccountingJson): Transaction[] {
  const transactions: Transaction[] = []

  for (const monthData of Object.values(accountingData)) {
    for (const row of monthData.Data) {
      transactions.push({
        date: row.Date,
        itemName: row.ItemName,
        category: row.Category,
        originalAmount: row.OriginalAmount,
        share: toNumber(row.Share),
        finalAmount: row.FinalAmount,
        exclude: toNumber(row.Exclude),
        gf: toNumber(row.Gf),
        girlFriendPercentage: row.girlFriendPercentage,
        trip: row.Trip,
      })
    }
  }

  return transactions
}
