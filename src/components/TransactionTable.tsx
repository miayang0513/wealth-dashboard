import { useRef, useState, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Transaction, getTransactionType } from '@/models/transaction'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getCategoryIcon, getCategoryColor, hexToRgba } from '@/lib/category'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { parse } from 'date-fns'

type SortOrder = 'newest' | 'oldest'

interface TransactionTableProps {
  transactions: Transaction[]
}

const ROW_HEIGHT = 53 // Approximate height of a table row in pixels
const CARD_HEIGHT = 80 // Approximate height of a card item in pixels

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')

  // Sort transactions based on sortOrder
  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      const dateA = parse(a.date, 'yyyy-MM-dd HH:mm:ss', new Date())
      const dateB = parse(b.date, 'yyyy-MM-dd HH:mm:ss', new Date())
      return sortOrder === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
    })
    return sorted
  }, [transactions, sortOrder])

  const virtualizer = useVirtualizer({
    count: sortedTransactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => {
      // Use card height on mobile, row height on desktop
      // We'll use a media query check, but for simplicity, use card height
      // The actual rendering will handle the responsive layout
      return window.innerWidth < 768 ? CARD_HEIGHT : ROW_HEIGHT
    },
    measureElement: element => {
      // Measure the actual height of the row element
      return element?.getBoundingClientRect().height ?? ROW_HEIGHT
    },
    overscan: 10,
  })

  const virtualItems = virtualizer.getVirtualItems()

  const toggleSort = () => {
    setSortOrder(prev => (prev === 'newest' ? 'oldest' : 'newest'))
  }

  return (
    <Card className='overflow-hidden'>
      <style>{`
        @media (min-width: 768px) {
          .transaction-header,
          .transaction-row {
            grid-template-columns: minmax(120px, 1.5fr) 2fr 1.5fr 1fr 1.5fr !important;
          }
        }
      `}</style>
      <div className='overflow-x-auto'>
        <div
          ref={parentRef}
          className='h-[80dvh] md:h-[600px]'
          style={{
            overflow: 'auto',
          }}
        >
          {/* Desktop Header - Hidden on mobile */}
          <div
            className='transaction-header bg-background sticky top-0 z-10 hidden gap-0 border-b md:grid'
            style={{ gridTemplateColumns: 'minmax(120px, 1.5fr) 2fr 1.5fr 1fr 1.5fr' }}
          >
            <div className='text-muted-foreground flex h-10 items-center px-2 text-left align-middle text-sm font-medium'>
              Date
            </div>
            <div className='text-muted-foreground flex h-10 items-center px-2 text-left align-middle text-sm font-medium'>
              Item Name
            </div>
            <div className='text-muted-foreground flex h-10 items-center px-2 text-left align-middle text-sm font-medium'>
              Category
            </div>
            <div className='text-muted-foreground flex h-10 items-center px-2 text-left align-middle text-sm font-medium'>
              Amount
            </div>
            <div className='text-muted-foreground flex h-10 items-center px-2 text-left align-middle text-sm font-medium'>
              Notes
            </div>
            {/* Category Filter and Sort Button - Absolute positioned */}
            <div className='absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={toggleSort}
                className='flex h-7 items-center gap-1.5 px-2 text-xs'
              >
                {sortOrder === 'newest' ? (
                  <>
                    <ArrowDown className='h-3.5 w-3.5' />
                    <span className='hidden lg:inline'>最新到最舊</span>
                  </>
                ) : (
                  <>
                    <ArrowUp className='h-3.5 w-3.5' />
                    <span className='hidden lg:inline'>最舊到最新</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Sort Button */}
          <div className='bg-background sticky top-0 z-10 flex items-center justify-end gap-2 border-b p-2 md:hidden'>
            <Button variant='outline' size='sm' onClick={toggleSort} className='flex items-center gap-2'>
              {sortOrder === 'newest' ? (
                <>
                  <ArrowDown className='h-4 w-4' />
                  <span>最新到最舊</span>
                </>
              ) : (
                <>
                  <ArrowUp className='h-4 w-4' />
                  <span>最舊到最新</span>
                </>
              )}
            </Button>
          </div>

          {/* Mobile List - Normal flow layout */}
          <div className='md:hidden'>
            {sortedTransactions.length === 0 ? (
              <div className='text-muted-foreground p-4 text-center'>No transactions found</div>
            ) : (
              sortedTransactions.map((transaction, index) => {
                const type = getTransactionType(transaction)
                const amountColor =
                  type === 'income'
                    ? 'text-green-600 dark:text-green-400'
                    : type === 'expense'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-muted-foreground'

                // Get category icon and color
                const CategoryIcon = getCategoryIcon(transaction.category)
                const categoryColor = getCategoryColor(transaction.category)

                return (
                  <div
                    key={index}
                    className='mx-2 my-1 flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2.5'
                  >
                    <div className='flex min-w-0 flex-1 items-center gap-2'>
                      <div
                        className='flex shrink-0 items-center justify-center rounded-md p-1'
                        style={{ backgroundColor: hexToRgba(categoryColor, 0.1) }}
                      >
                        <CategoryIcon className='h-3.5 w-3.5' style={{ color: categoryColor }} />
                      </div>
                      <div className='flex min-w-0 flex-1 flex-col'>
                        <div className='truncate text-sm font-medium text-gray-900'>{transaction.itemName}</div>
                        <div className='text-muted-foreground text-xs'>{transaction.date}</div>
                      </div>
                    </div>
                    <div className={cn('ml-3 shrink-0 text-right text-sm font-medium', amountColor)}>
                      {transaction.finalAmount > 0 ? '-' : '+'}
                      {Math.abs(transaction.finalAmount).toFixed(2)}$
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Desktop Table Body - Virtual scrolling */}
          <div
            className='hidden md:block'
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {sortedTransactions.length === 0 ? (
              <div className='text-muted-foreground p-4 text-center'>No transactions found</div>
            ) : (
              virtualItems.map(virtualRow => {
                const transaction = sortedTransactions[virtualRow.index]
                const type = getTransactionType(transaction)
                const amountColor =
                  type === 'income'
                    ? 'text-green-600 dark:text-green-400'
                    : type === 'expense'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-muted-foreground'

                // Get category icon and color
                const CategoryIcon = getCategoryIcon(transaction.category)
                const categoryColor = getCategoryColor(transaction.category)

                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={el => {
                      if (el) {
                        rowRefs.current.set(virtualRow.index, el)
                        virtualizer.measureElement(el)
                      } else {
                        rowRefs.current.delete(virtualRow.index)
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {/* Desktop Table Row */}
                    <div
                      className='transaction-row hover:bg-muted/50 grid gap-0 border-b transition-colors'
                      style={{
                        gridTemplateColumns: 'minmax(120px, 1.5fr) 2fr 1.5fr 1fr 1.5fr',
                      }}
                    >
                      <div className='flex items-center p-2 align-middle text-sm font-medium'>{transaction.date}</div>
                      <div className='flex items-center truncate p-2 align-middle text-sm'>{transaction.itemName}</div>
                      <div className='text-muted-foreground flex items-center gap-2 p-2 align-middle text-sm'>
                        <div
                          className='flex shrink-0 items-center justify-center rounded-md p-1'
                          style={{ backgroundColor: hexToRgba(categoryColor, 0.1) }}
                        >
                          <CategoryIcon className='h-3.5 w-3.5' style={{ color: categoryColor }} />
                        </div>
                        <span>{transaction.category}</span>
                      </div>
                      <div className={cn('flex items-center p-2 align-middle text-sm font-medium', amountColor)}>
                        {transaction.finalAmount > 0 ? '-' : '+'}
                        {Math.abs(transaction.finalAmount).toFixed(2)}
                      </div>
                      <div className='text-muted-foreground flex items-center p-2 align-middle text-sm'>
                        {transaction.trip ? 'Trip' : ''}
                        {transaction.gf > 0 ? (transaction.trip ? ', ' : '') + 'GF' : ''}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
