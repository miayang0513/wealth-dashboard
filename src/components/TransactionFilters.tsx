import { DateFilter, DateFilterType } from '@/utils/dateFilter'

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

  const handleYearChange = (year: number) => {
    if (filter.type === 'year') {
      onFilterChange({ ...filter, year })
    } else if (filter.type === 'month') {
      onFilterChange({ ...filter, year })
    }
  }

  const handleMonthChange = (month: number) => {
    if (filter.type === 'month') {
      onFilterChange({ ...filter, month })
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
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
      <h2 className='mb-4 text-lg font-semibold'>Filters</h2>

      <div className='space-y-4'>
        {/* Filter Type Selection */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>Date Range Type</label>
          <div className='flex space-x-4'>
            <label className='flex items-center'>
              <input
                type='radio'
                name='filterType'
                value='year'
                checked={filter.type === 'year'}
                onChange={() => handleTypeChange('year')}
                className='mr-2'
              />
              Year
            </label>
            <label className='flex items-center'>
              <input
                type='radio'
                name='filterType'
                value='month'
                checked={filter.type === 'month'}
                onChange={() => handleTypeChange('month')}
                className='mr-2'
              />
              Month
            </label>
            <label className='flex items-center'>
              <input
                type='radio'
                name='filterType'
                value='custom'
                checked={filter.type === 'custom'}
                onChange={() => handleTypeChange('custom')}
                className='mr-2'
              />
              Custom Range
            </label>
          </div>
        </div>

        {/* Year Filter */}
        {(filter.type === 'year' || filter.type === 'month') && (
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>Year</label>
            <select
              value={filter.year || ''}
              onChange={e => handleYearChange(parseInt(e.target.value, 10))}
              className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            >
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Month Filter */}
        {filter.type === 'month' && (
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>Month</label>
            <select
              value={filter.month || ''}
              onChange={e => handleMonthChange(parseInt(e.target.value, 10))}
              className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {new Date(2000, month - 1, 1).toLocaleString('zh-TW', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Custom Range Filter */}
        {filter.type === 'custom' && (
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>From</label>
              <input
                type='date'
                value={filter.from ? filter.from.toISOString().split('T')[0] : ''}
                onChange={e => handleFromChange(new Date(e.target.value))}
                className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              />
            </div>
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>To</label>
              <input
                type='date'
                value={filter.to ? filter.to.toISOString().split('T')[0] : ''}
                onChange={e => handleToChange(new Date(e.target.value))}
                className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
