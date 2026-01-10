import { useMemo } from 'react'
import { parse } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '@/models/transaction'
import { DateFilter } from '@/utils/dateFilter'
import { getTransactionType } from '@/models/transaction'

interface TransactionChartProps {
  transactions: Transaction[]
  filter: DateFilter
}

interface ChartDataItem {
  period: string // 月份名称或日期
  income: number
  expense: number
}

const INCOME_CATEGORIES = ['Salary', 'OtherIncomes']

function isIncomeCategory(category: string): boolean {
  return INCOME_CATEGORIES.includes(category)
}

/**
 * 计算收入：只有 Salary 和 OtherIncomes 类别且 finalAmount < 0 的交易
 */
function calculateIncome(transactions: Transaction[]): number {
  return transactions
    .filter(t => {
      const isIncome = getTransactionType(t) === 'income'
      return isIncome && isIncomeCategory(t.category)
    })
    .reduce((sum, t) => sum + Math.abs(t.finalAmount), 0)
}

/**
 * 计算支出：
 * 1. 所有 finalAmount > 0 的交易（真正的支出）
 * 2. 所有 finalAmount < 0 但不是 Salary 或 OtherIncomes 的交易（从支出中抵销，即减去）
 */
function calculateExpense(transactions: Transaction[]): number {
  const positiveExpenses = transactions
    .filter(t => t.finalAmount > 0)
    .reduce((sum, t) => sum + t.finalAmount, 0)
  
  const offsetAmount = transactions
    .filter(t => t.finalAmount < 0 && !isIncomeCategory(t.category))
    .reduce((sum, t) => sum + Math.abs(t.finalAmount), 0)
  
  return positiveExpenses - offsetAmount
}

/**
 * 按月份聚合数据（用于 Year filter）
 */
function aggregateByMonth(transactions: Transaction[], year: number): ChartDataItem[] {
  const monthMap = new Map<number, Transaction[]>()
  
  // 初始化所有月份
  for (let month = 1; month <= 12; month++) {
    monthMap.set(month, [])
  }
  
  // 按月份分组交易
  transactions.forEach(t => {
    try {
      const transactionDate = parse(t.date, 'yyyy-MM-dd HH:mm:ss', new Date())
      const transactionYear = transactionDate.getFullYear()
      const month = transactionDate.getMonth() + 1
      
      if (transactionYear === year) {
        const monthTransactions = monthMap.get(month) || []
        monthTransactions.push(t)
        monthMap.set(month, monthTransactions)
      }
    } catch (error) {
      console.warn('Failed to parse date:', t.date, error)
    }
  })
  
  // 转换为图表数据
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  
  return Array.from(monthMap.entries())
    .map(([month, monthTransactions]) => ({
      period: monthNames[month - 1],
      income: calculateIncome(monthTransactions),
      expense: calculateExpense(monthTransactions),
    }))
}

/**
 * 按日期聚合数据（用于 Month filter）
 */
function aggregateByDay(transactions: Transaction[], year: number, month: number): ChartDataItem[] {
  const dayMap = new Map<number, Transaction[]>()
  
  // 获取该月的天数
  const daysInMonth = new Date(year, month, 0).getDate()
  
  // 初始化所有日期
  for (let day = 1; day <= daysInMonth; day++) {
    dayMap.set(day, [])
  }
  
  // 按日期分组交易
  transactions.forEach(t => {
    try {
      const transactionDate = parse(t.date, 'yyyy-MM-dd HH:mm:ss', new Date())
      const transactionYear = transactionDate.getFullYear()
      const transactionMonth = transactionDate.getMonth() + 1
      const day = transactionDate.getDate()
      
      if (transactionYear === year && transactionMonth === month) {
        const dayTransactions = dayMap.get(day) || []
        dayTransactions.push(t)
        dayMap.set(day, dayTransactions)
      }
    } catch (error) {
      console.warn('Failed to parse date:', t.date, error)
    }
  })
  
  // 转换为图表数据（月份模式下只显示支出）
  return Array.from(dayMap.entries())
    .map(([day, dayTransactions]) => ({
      period: day.toString(),
      income: 0, // 月份模式下不显示收入
      expense: calculateExpense(dayTransactions),
    }))
}

export default function TransactionChart({ transactions, filter }: TransactionChartProps) {
  const chartData = useMemo(() => {
    if (filter.type === 'year' && filter.year) {
      return aggregateByMonth(transactions, filter.year)
    } else if (filter.type === 'month' && filter.year && filter.month) {
      return aggregateByDay(transactions, filter.year, filter.month)
    }
    return []
  }, [transactions, filter])

  // 计算月份模式下 Y 轴的最大值，确保从 0 开始
  const yAxisDomain = useMemo(() => {
    if (filter.type === 'month' && chartData.length > 0) {
      const expenses = chartData.map(item => Math.max(0, item.expense))
      const maxExpense = Math.max(...expenses)
      // 如果所有值都是 0，设置一个默认的最小范围
      if (maxExpense === 0 || !isFinite(maxExpense)) {
        return [0, 100]
      }
      // 添加一些 padding，让最大值稍微高一点
      const paddedMax = Math.ceil(maxExpense * 1.1)
      return [0, paddedMax]
    }
    return ['auto', 'auto']
  }, [filter.type, chartData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const chartTitle = useMemo(() => {
    if (filter.type === 'year' && filter.year) {
      return `${filter.year} 年度收支趨勢`
    } else if (filter.type === 'month' && filter.year && filter.month) {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
      return `${filter.year} ${monthNames[filter.month - 1]} 每日支出趨勢`
    }
    return '收支趨勢'
  }, [filter])

  if (chartData.length === 0) {
    return null
  }

  return (
    <Card className='shadow-sm'>
      <CardHeader className='pb-2 pt-4 px-4'>
        <CardTitle className='text-base font-semibold'>{chartTitle}</CardTitle>
      </CardHeader>
      <CardContent className='px-4 pb-4'>
        <ResponsiveContainer width='100%' height={350}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
            <XAxis 
              dataKey='period' 
              className='text-xs'
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              className='text-xs'
              tick={{ fill: 'currentColor' }}
              domain={yAxisDomain}
              allowDataOverflow={false}
              tickFormatter={(value) => {
                if (value >= 1000) {
                  return `£${(value / 1000).toFixed(1)}k`
                }
                return `£${value}`
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const income = payload.find(p => p.dataKey === 'income')?.value as number || 0
                  const expense = payload.find(p => p.dataKey === 'expense')?.value as number || 0
                  const period = payload[0]?.payload?.period || ''
                  const isMonthMode = filter.type === 'month'
                  
                  return (
                    <div className='rounded-md border bg-card p-3 shadow-md'>
                      <p className='font-semibold text-sm mb-2'>{period}</p>
                      <div className='space-y-1 text-xs'>
                        {!isMonthMode && (
                          <div className='flex items-center gap-2'>
                            <div className='w-3 h-3 rounded-full bg-blue-500' />
                            <span className='text-muted-foreground'>收入:</span>
                            <span className='font-semibold text-blue-600 dark:text-blue-400'>
                              {formatCurrency(income)}
                            </span>
                          </div>
                        )}
                        <div className='flex items-center gap-2'>
                          <div className='w-3 h-3 rounded-full bg-red-500' />
                          <span className='text-muted-foreground'>支出:</span>
                          <span className='font-semibold text-red-600 dark:text-red-400'>
                            {formatCurrency(expense)}
                          </span>
                        </div>
                        {!isMonthMode && (
                          <div className='flex items-center gap-2 pt-1 border-t'>
                            <span className='text-muted-foreground'>淨額:</span>
                            <span className={`font-semibold ${income - expense >= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                              {formatCurrency(income - expense)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            {filter.type !== 'month' && (
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType='circle'
                formatter={(value) => {
                  if (value === 'income') return '收入'
                  if (value === 'expense') return '支出'
                  return value
                }}
              />
            )}
            {filter.type !== 'month' && (
              <Bar 
                dataKey='income' 
                fill='#3b82f6' 
                name='income'
                radius={[4, 4, 0, 0]}
              />
            )}
            <Bar 
              dataKey='expense' 
              fill='#ef4444' 
              name='expense'
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

