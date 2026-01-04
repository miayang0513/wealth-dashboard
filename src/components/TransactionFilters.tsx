import { DateFilter, DateFilterType } from '@/utils/dateFilter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface TransactionFiltersProps {
  filter: DateFilter
  availableYears: number[]
  onFilterChange: (filter: DateFilter) => void
}

export default function TransactionFilters({ filter, availableYears, onFilterChange }: TransactionFiltersProps) {
  const handleTypeChange = (type: DateFilterType) => {
    if (type === 'year') {
      onFilterChange({ type: 'year', year: availableYears[0] })
    } else if (type === 'month') {
      onFilterChange({ type: 'month', year: availableYears[0], month: 1 })
    } else {
      onFilterChange({ type: 'custom' })
    }
  }

  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year, 10)
    if (filter.type === 'year') {
      onFilterChange({ ...filter, year: yearNum })
    } else if (filter.type === 'month') {
      onFilterChange({ ...filter, year: yearNum })
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
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {/* Filter Type Selection */}
          <div className='space-y-2'>
            <Label>Date Range Type</Label>
            <RadioGroup
              value={filter.type}
              onValueChange={(value) => handleTypeChange(value as DateFilterType)}
              className='flex space-x-4'
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='year' id='year' />
                <Label htmlFor='year' className='cursor-pointer font-normal'>Year</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='month' id='month' />
                <Label htmlFor='month' className='cursor-pointer font-normal'>Month</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='custom' id='custom' />
                <Label htmlFor='custom' className='cursor-pointer font-normal'>Custom Range</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Year Filter */}
          {(filter.type === 'year' || filter.type === 'month') && (
            <div className='space-y-2'>
              <Label htmlFor='year-select'>Year</Label>
              <Select
                value={filter.year?.toString() || ''}
                onValueChange={handleYearChange}
              >
                <SelectTrigger id='year-select'>
                  <SelectValue placeholder='Select year' />
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
          {filter.type === 'month' && (
            <div className='space-y-2'>
              <Label htmlFor='month-select'>Month</Label>
              <Select
                value={filter.month?.toString() || ''}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger id='month-select'>
                  <SelectValue placeholder='Select month' />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
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
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='from-date'>From</Label>
                <Input
                  id='from-date'
                  type='date'
                  value={filter.from ? filter.from.toISOString().split('T')[0] : ''}
                  onChange={e => handleFromChange(new Date(e.target.value))}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='to-date'>To</Label>
                <Input
                  id='to-date'
                  type='date'
                  value={filter.to ? filter.to.toISOString().split('T')[0] : ''}
                  onChange={e => handleToChange(new Date(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
