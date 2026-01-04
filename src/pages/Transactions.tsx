import { useState, useMemo, useEffect } from 'react'
import { loadTransactions } from '@/data/loadData'
import { Transaction } from '@/models/transaction'
import { DateFilter, filterTransactionsByDate, getAvailableYears } from '@/utils/dateFilter'
import { calculateOverview } from '@/models/overview'
import TransactionFilters from '@/components/TransactionFilters'
import TransactionOverview from '@/components/TransactionOverview'
import TransactionTable from '@/components/TransactionTable'

export default function Transactions() {
  const allTransactions = useMemo(() => loadTransactions(), [])
  const availableYears = useMemo(() => getAvailableYears(allTransactions), [allTransactions])

  const [dateFilter, setDateFilter] = useState<DateFilter>({
    type: 'year',
    year: undefined,
  })

  // 當 availableYears 載入後，更新 dateFilter
  useEffect(() => {
    if (availableYears.length > 0 && dateFilter.year === undefined) {
      setDateFilter({
        type: 'year',
        year: availableYears[0],
      })
    }
  }, [availableYears, dateFilter.year])

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((t: Transaction) => filterTransactionsByDate(t, dateFilter))
  }, [allTransactions, dateFilter])

  const overview = useMemo(() => calculateOverview(filteredTransactions), [filteredTransactions])

  const handleFilterChange = (filter: DateFilter) => {
    setDateFilter(filter)
  }

  return (
    <div>
      <h1 className='mb-6 text-3xl font-bold tracking-tight'>Transactions</h1>

      <div className='mb-6'>
        <TransactionFilters filter={dateFilter} availableYears={availableYears} onFilterChange={handleFilterChange} />
      </div>

      <div className='mb-6'>
        <TransactionOverview overview={overview} />
      </div>

      <div>
        <TransactionTable transactions={filteredTransactions} />
      </div>
    </div>
  )
}
