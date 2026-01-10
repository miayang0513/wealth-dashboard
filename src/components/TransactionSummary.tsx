import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Overview } from '@/models/overview'

interface TransactionSummaryProps {
  overview: Overview
}

export default function TransactionSummary({ overview }: TransactionSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const netAmount = overview.totalIncome - overview.totalExpense
  const netPercentage = overview.totalIncome > 0 ? ((netAmount / overview.totalIncome) * 100).toFixed(1) : '0.0'

  return (
    <div className='grid grid-cols-1 gap-2.5 md:grid-cols-3'>
      {/* 淨額 */}
      <Card
        className={cn(
          'relative overflow-hidden border-l-4 shadow-sm transition-all hover:shadow-md',
          netAmount >= 0 ? 'border-l-green-500' : 'border-l-orange-500'
        )}
      >
        <CardContent className='p-3'>
          <div className='flex items-start justify-between'>
            <div className='space-y-0.5'>
              <p className='text-muted-foreground text-xs font-medium'>淨額</p>
              <p
                className={cn(
                  'text-xl font-bold',
                  netAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                )}
              >
                {formatCurrency(netAmount)}
              </p>
              <p className='text-muted-foreground text-[10px]'>
                {netAmount >= 0 ? '+' : ''}
                {netPercentage}% of income
              </p>
            </div>
            <div
              className={cn(
                'rounded-full p-1.5',
                netAmount >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
              )}
            >
              <svg
                className={cn(
                  'h-4 w-4',
                  netAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
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
              <p className='text-muted-foreground text-xs font-medium'>總收入</p>
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
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
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
              <p className='text-muted-foreground text-xs font-medium'>總支出</p>
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
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 12H4' />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

