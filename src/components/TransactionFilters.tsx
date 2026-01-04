import { DateFilter, DateFilterType, getAvailableMonths } from '@/utils/dateFilter'
import { Transaction } from '@/models/transaction'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useMemo } from 'react'

interface TransactionFiltersProps {
  filter: DateFilter
  availableYears: number[]
  allTransactions: Transaction[]
  onFilterChange: (filter: DateFilter) => void
}

export default function TransactionFilters({ filter, availableYears, allTransactions, onFilterChange }: TransactionFiltersProps) {
  // 根據選中的年份動態獲取可用月份
  const availableMonths = useMemo(() => {
    if (filter.type === 'month' && filter.year) {
      return getAvailableMonths(allTransactions, filter.year)
    }
    return []
  }, [filter.type, filter.year, allTransactions])

  const handleTypeChange = (type: string) => {
    const filterType = type as DateFilterType
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    
    if (filterType === 'year') {
      onFilterChange({ type: 'year', year: availableYears.includes(currentYear) ? currentYear : availableYears[0] })
    } else if (filterType === 'month') {
      const year = availableYears.includes(currentYear) ? currentYear : availableYears[0]
      const months = getAvailableMonths(allTransactions, year)
      // 如果使用当前年份，尝试使用当前月份；否则使用第一个可用月份
      const month = availableYears.includes(currentYear) && months.includes(currentMonth) 
        ? currentMonth 
        : months[0] || 1
      onFilterChange({ type: 'month', year, month })
    } else {
      onFilterChange({ type: 'custom' })
    }
  }

  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year, 10)
    if (filter.type === 'year') {
      onFilterChange({ ...filter, year: yearNum })
    } else if (filter.type === 'month') {
      // 當年份改變時，檢查當前月份是否在新年份的可用月份中
      const months = getAvailableMonths(allTransactions, yearNum)
      const currentMonth = filter.month && months.includes(filter.month) 
        ? filter.month 
        : months[0] || 1
      onFilterChange({ ...filter, year: yearNum, month: currentMonth })
    }
  }

  const handleMonthChange = (month: string) => {
    if (filter.type === 'month') {
      onFilterChange({ ...filter, month: parseInt(month, 10) })
    }
  }

  const handleFromChange = (from: Date) => {
    if (filter.type === 'custom') {
      onFilterChange({ ...filter, from })
    }
  }

  const handleToChange = (to: Date) => {
    if (filter.type === 'custom') {
      onFilterChange({ ...filter, to })
    }
  }

  return (
    <div className='flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3'>
      {/* Filter Type Selection */}
      <div className='flex items-center gap-2'>
        <Label className='text-sm text-muted-foreground'>範圍：</Label>
        <Select
          value={filter.type}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className='h-8 w-24'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='year'>年度</SelectItem>
            <SelectItem value='month'>月份</SelectItem>
            <SelectItem value='custom'>自訂</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Year Filter */}
      {(filter.type === 'year' || filter.type === 'month') && (
        <div className='flex items-center gap-2'>
          <Label htmlFor='year-select' className='text-sm text-muted-foreground'>年份：</Label>
          <Select
            value={filter.year?.toString() || ''}
            onValueChange={handleYearChange}
          >
            <SelectTrigger id='year-select' className='h-8 w-24'>
              <SelectValue placeholder='選擇年份' />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Month Filter */}
      {filter.type === 'month' && filter.year && availableMonths.length > 0 && (
        <div className='flex items-center gap-2'>
          <Label htmlFor='month-select' className='text-sm text-muted-foreground'>月份：</Label>
          <Select
            value={filter.month?.toString() || ''}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger id='month-select' className='h-8 w-28'>
              <SelectValue placeholder='選擇月份' />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(month => (
                <SelectItem key={month} value={month.toString()}>
                  {new Date(2000, month - 1, 1).toLocaleString('zh-TW', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Custom Range Filter */}
      {filter.type === 'custom' && (
        <>
          <div className='flex items-center gap-2'>
            <Label htmlFor='from-date' className='text-sm text-muted-foreground'>從：</Label>
            <Input
              id='from-date'
              type='date'
              value={filter.from ? filter.from.toISOString().split('T')[0] : ''}
              onChange={e => handleFromChange(new Date(e.target.value))}
              className='h-8 w-36'
            />
          </div>
          <div className='flex items-center gap-2'>
            <Label htmlFor='to-date' className='text-sm text-muted-foreground'>至：</Label>
            <Input
              id='to-date'
              type='date'
              value={filter.to ? filter.to.toISOString().split('T')[0] : ''}
              onChange={e => handleToChange(new Date(e.target.value))}
              className='h-8 w-36'
            />
          </div>
        </>
      )}
    </div>
  )
}
