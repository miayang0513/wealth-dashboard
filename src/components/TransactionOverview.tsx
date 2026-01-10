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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <>
      {/* Category Breakdown */}
      {overview.categoryBreakdown.length > 0 && (
        <Card className='shadow-sm'>
          <CardHeader className='px-4 pt-4 pb-2'>
            <CardTitle className='text-base font-semibold'>支出類別分析</CardTitle>
          </CardHeader>
          <CardContent className='px-4 pb-4'>
            <div className='flex flex-col items-center md:flex-row'>
              {/* 圖表 */}
              <div className='relative w-full md:max-w-md md:flex-1'>
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
                        const isSelected = selectedCategory === category
                        const baseColor = getCategoryColor(category)
                        
                        // Apply hover or selected effect
                        const isHighlighted = isHovered || isSelected

                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={baseColor}
                            opacity={isHighlighted ? 1 : (hoveredIndex !== null || selectedCategory !== null) ? 0.3 : 1}
                            style={{
                              filter: isHighlighted ? 'brightness(1.1) drop-shadow(0 0 8px rgba(0,0,0,0.2))' : 'none',
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
                          const item = pieData.find(d => d.name === data.name)
                          const categoryName = data.name as string
                          const iconColor = getCategoryColor(categoryName)
                          const Icon = getCategoryIcon(categoryName)

                          return (
                            <div className='bg-card relative z-50 rounded-md border p-3 shadow-md'>
                              <div className='mb-2 flex items-center gap-2'>
                                {/* Icon */}
                                <div
                                  className='flex shrink-0 items-center justify-center rounded-md p-1'
                                  style={{ backgroundColor: hexToRgba(iconColor, 0.1) }}
                                >
                                  <Icon className='h-3.5 w-3.5' style={{ color: iconColor }} />
                                </div>
                                <p className='text-sm font-semibold'>{data.name}</p>
                              </div>
                              <div className='space-y-0.5 text-xs'>
                                <p className='text-muted-foreground'>
                                  金額:{' '}
                                  <span className='text-foreground font-semibold'>
                                    {formatCurrency(data.value as number)}
                                  </span>
                                </p>
                                {item && (
                                  <p className='text-muted-foreground'>
                                    百分比: <span className='text-foreground font-semibold'>{item.percentage}%</span>
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
                {/* 中心顯示總金額或 hover/selected 的項目信息 */}
                <div className='pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center'>
                  {(() => {
                    // 优先显示选中的 category，其次显示 hover 的
                    const selectedIndex = selectedCategory 
                      ? orderedCategoryBreakdown.findIndex(item => item.category === selectedCategory)
                      : -1
                    const displayIndex = selectedIndex >= 0 ? selectedIndex : hoveredIndex
                    
                    if (displayIndex !== null && displayIndex >= 0 && orderedCategoryBreakdown[displayIndex]) {
                      return (
                        <>
                          <p className='text-muted-foreground mb-1 text-xs font-medium'>
                            {orderedCategoryBreakdown[displayIndex].category}
                          </p>
                          <p className='text-foreground mb-0.5 text-lg font-bold'>
                            {formatCurrency(orderedCategoryBreakdown[displayIndex].amount)}
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            {orderedCategoryBreakdown[displayIndex].percentage.toFixed(1)}%
                          </p>
                        </>
                      )
                    }
                    return (
                      <>
                        <p className='text-muted-foreground text-xs font-medium'>Total</p>
                        <p className='text-foreground text-lg font-bold'>{formatCurrency(overview.totalExpense)}</p>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* 列表（代替圖例） */}
              <div className='grid w-full flex-1 grid-cols-2 gap-2 md:grid-cols-3'>
                {orderedCategoryBreakdown.map((item: CategoryBreakdown, index: number) => {
                  const Icon = getCategoryIcon(item.category)
                  const iconColor = getCategoryColor(item.category)

                  const isSelected = selectedCategory === item.category

                  return (
                    <div
                      key={item.category}
                      className={cn(
                        'group bg-card relative overflow-hidden rounded-md border p-2.5 transition-all hover:shadow-sm',
                        isSelected && 'ring-primary ring-2',
                        onCategoryClick && 'cursor-pointer'
                      )}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => onCategoryClick?.(item.category)}
                    >
                      <div className='flex flex-col gap-1.5'>
                        <div className='flex items-center justify-between'>
                          <div className='flex min-w-0 flex-1 items-center gap-1.5'>
                            {/* 顏色圓點 */}
                            <div className='h-2.5 w-2.5 shrink-0 rounded-full' style={{ backgroundColor: iconColor }} />
                            {/* Icon */}
                            <div
                              className='flex shrink-0 items-center justify-center rounded-md p-1'
                              style={{ backgroundColor: hexToRgba(iconColor, 0.1) }}
                            >
                              <Icon className='h-3.5 w-3.5' style={{ color: iconColor }} />
                            </div>
                            <span className='truncate text-xs font-medium'>{item.category}</span>
                          </div>
                        </div>
                        <div className='flex items-baseline justify-between gap-2'>
                          <div className='truncate text-sm font-semibold'>{formatCurrency(item.amount)}</div>
                          <div className='text-muted-foreground text-[10px] whitespace-nowrap'>
                            {item.percentage.toFixed(1)}%
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className='bg-muted mt-1 h-1 w-full overflow-hidden rounded-full'>
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
    </>
  )
}
