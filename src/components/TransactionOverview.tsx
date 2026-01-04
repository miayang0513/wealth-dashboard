import { useState } from 'react'
import { Overview, CategoryBreakdown } from '@/models/overview'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getCategoryIcon, getCategoryColor, hexToRgba } from '@/lib/category'

interface TransactionOverviewProps {
  overview: Overview
  selectedCategory?: string | null
  onCategoryClick?: (category: string) => void
}

interface PieDataItem {
  name: string
  value: number
  percentage: string
}

export default function TransactionOverview({ overview, selectedCategory, onCategoryClick }: TransactionOverviewProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  // 使用固定順序的類別列表
  const orderedCategoryBreakdown = overview.categoryBreakdown

  const pieData: PieDataItem[] = orderedCategoryBreakdown.map((item: CategoryBreakdown) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage.toFixed(1),
  }))

  const netAmount = overview.totalIncome - overview.totalExpense
  const netPercentage = overview.totalIncome > 0 
    ? ((netAmount / overview.totalIncome) * 100).toFixed(1)
    : '0.0'

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className='space-y-3'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-2.5 md:grid-cols-3'>
        {/* 淨額 */}
        <Card
          className={cn(
            'relative overflow-hidden border-l-4 shadow-sm transition-all hover:shadow-md',
            netAmount >= 0
              ? 'border-l-green-500'
              : 'border-l-orange-500'
          )}
        >
          <CardContent className='p-3'>
            <div className='flex items-start justify-between'>
              <div className='space-y-0.5'>
                <p className='text-xs font-medium text-muted-foreground'>淨額</p>
                <p
                  className={cn(
                    'text-xl font-bold',
                    netAmount >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-orange-600 dark:text-orange-400'
                  )}
                >
                  {formatCurrency(netAmount)}
                </p>
                <p className='text-[10px] text-muted-foreground'>
                  {netAmount >= 0 ? '+' : ''}{netPercentage}% of income
                </p>
              </div>
              <div
                className={cn(
                  'rounded-full p-1.5',
                  netAmount >= 0
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-orange-100 dark:bg-orange-900/30'
                )}
              >
                <svg
                  className={cn(
                    'h-4 w-4',
                    netAmount >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-orange-600 dark:text-orange-400'
                  )}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  {netAmount >= 0 ? (
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                    />
                  ) : (
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
                    />
                  )}
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 總收入 */}
        <Card className='relative overflow-hidden border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md'>
          <CardContent className='p-3'>
            <div className='flex items-start justify-between'>
              <div className='space-y-0.5'>
                <p className='text-xs font-medium text-muted-foreground'>總收入</p>
                <p className='text-xl font-bold text-blue-600 dark:text-blue-400'>
                  {formatCurrency(overview.totalIncome)}
                </p>
              </div>
              <div className='rounded-full bg-blue-100 p-1.5 dark:bg-blue-900/30'>
                <svg
                  className='h-4 w-4 text-blue-600 dark:text-blue-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4v16m8-8H4'
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 總支出 */}
        <Card className='relative overflow-hidden border-l-4 border-l-red-500 shadow-sm transition-all hover:shadow-md'>
          <CardContent className='p-3'>
            <div className='flex items-start justify-between'>
              <div className='space-y-0.5'>
                <p className='text-xs font-medium text-muted-foreground'>總支出</p>
                <p className='text-xl font-bold text-red-600 dark:text-red-400'>
                  {formatCurrency(overview.totalExpense)}
                </p>
              </div>
              <div className='rounded-full bg-red-100 p-1.5 dark:bg-red-900/30'>
                <svg
                  className='h-4 w-4 text-red-600 dark:text-red-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M20 12H4'
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {overview.categoryBreakdown.length > 0 && (
        <Card className='shadow-sm'>
          <CardHeader className='pb-2 pt-4 px-4'>
            <CardTitle className='text-base font-semibold'>支出類別分析</CardTitle>
          </CardHeader>
          <CardContent className='px-4 pb-4'>
            <div className='flex flex-col md:flex-row items-center'>
              {/* 圖表 */}
              <div className='relative w-full md:flex-1 md:max-w-md'>
                <ResponsiveContainer width='100%' height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ percentage }) => {
                        // 只有當百分比 >= 5 時才顯示
                        if (percentage >= 5) {
                          return `${percentage}%`
                        }
                        return ''
                      }}
                      outerRadius={100}
                      innerRadius={60}
                      fill='#8884d8'
                      dataKey='value'
                      paddingAngle={2}
                    >
                      {pieData.map((_: PieDataItem, index: number) => {
                        const isHovered = hoveredIndex === index
                        const category = orderedCategoryBreakdown[index]?.category || ''
                        const baseColor = getCategoryColor(category)
                        
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={baseColor}
                            opacity={isHovered ? 1 : hoveredIndex !== null ? 0.3 : 1}
                            style={{
                              filter: isHovered ? 'brightness(1.1) drop-shadow(0 0 8px rgba(0,0,0,0.2))' : 'none',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                            }}
                          />
                        )
                      })}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0]
                          const item = pieData.find((d) => d.name === data.name)
                          const categoryName = data.name as string
                          const iconColor = getCategoryColor(categoryName)
                          const Icon = getCategoryIcon(categoryName)
                          
                          return (
                            <div className='rounded-md border bg-card p-3 shadow-md z-50 relative'>
                              <div className='flex items-center gap-2 mb-2'>
                                {/* Icon */}
                                <div
                                  className='p-1 rounded-md shrink-0 flex items-center justify-center'
                                  style={{ backgroundColor: hexToRgba(iconColor, 0.1) }}
                                >
                                  <Icon
                                    className='h-3.5 w-3.5'
                                    style={{ color: iconColor }}
                                  />
                                </div>
                                <p className='font-semibold text-sm'>{data.name}</p>
                              </div>
                              <div className='space-y-0.5 text-xs'>
                                <p className='text-muted-foreground'>
                                  金額: <span className='font-semibold text-foreground'>{formatCurrency(data.value as number)}</span>
                                </p>
                                {item && (
                                  <p className='text-muted-foreground'>
                                    百分比: <span className='font-semibold text-foreground'>{item.percentage}%</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                      wrapperStyle={{ zIndex: 50 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* 中心顯示總金額或 hover 的項目信息 */}
                <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0'>
                  {hoveredIndex !== null && orderedCategoryBreakdown[hoveredIndex] ? (
                    <>
                      <p className='text-xs font-medium text-muted-foreground mb-1'>
                        {orderedCategoryBreakdown[hoveredIndex].category}
                      </p>
                      <p className='text-lg font-bold text-foreground mb-0.5'>
                        {formatCurrency(orderedCategoryBreakdown[hoveredIndex].amount)}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {orderedCategoryBreakdown[hoveredIndex].percentage.toFixed(1)}%
                      </p>
                    </>
                  ) : (
                    <>
                      <p className='text-xs font-medium text-muted-foreground'>Total</p>
                      <p className='text-lg font-bold text-foreground'>
                        {formatCurrency(overview.totalExpense)}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* 列表（代替圖例） */}
              <div className='flex-1 w-full grid grid-cols-2 md:grid-cols-3 gap-2'>
                {orderedCategoryBreakdown.map((item: CategoryBreakdown, index: number) => {
                  const Icon = getCategoryIcon(item.category)
                  const iconColor = getCategoryColor(item.category)
                  
                  const isSelected = selectedCategory === item.category
                  
                  return (
                    <div
                      key={item.category}
                      className={cn(
                        'group relative overflow-hidden rounded-md border bg-card p-2.5 transition-all hover:shadow-sm',
                        isSelected && 'ring-2 ring-primary',
                        onCategoryClick && 'cursor-pointer'
                      )}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => onCategoryClick?.(item.category)}
                    >
                      <div className='flex flex-col gap-1.5'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-1.5 flex-1 min-w-0'>
                            {/* 顏色圓點 */}
                            <div
                              className='w-2.5 h-2.5 rounded-full shrink-0'
                              style={{ backgroundColor: iconColor }}
                            />
                            {/* Icon */}
                            <div
                              className='p-1 rounded-md shrink-0 flex items-center justify-center'
                              style={{ backgroundColor: hexToRgba(iconColor, 0.1) }}
                            >
                              <Icon
                                className='h-3.5 w-3.5'
                                style={{ color: iconColor }}
                              />
                            </div>
                            <span className='font-medium text-xs truncate'>{item.category}</span>
                          </div>
                        </div>
                        <div className='flex items-baseline justify-between gap-2'>
                          <div className='font-semibold text-sm truncate'>
                            {formatCurrency(item.amount)}
                          </div>
                          <div className='text-[10px] text-muted-foreground whitespace-nowrap'>
                            {item.percentage.toFixed(1)}%
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className='mt-1 h-1 w-full overflow-hidden rounded-full bg-muted'>
                          <div
                            className='h-full transition-all duration-500'
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: iconColor,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
