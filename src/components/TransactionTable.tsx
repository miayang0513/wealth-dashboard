import { Transaction, getTransactionType } from '@/models/transaction'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TransactionTableProps {
  transactions: Transaction[]
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <Card>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center text-muted-foreground'>
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction, index) => {
                const type = getTransactionType(transaction)
                const amountColor =
                  type === 'income'
                    ? 'text-green-600 dark:text-green-400'
                    : type === 'expense'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-muted-foreground'

                return (
                  <TableRow key={index}>
                    <TableCell className='font-medium'>{transaction.date}</TableCell>
                    <TableCell>{transaction.itemName}</TableCell>
                    <TableCell className='text-muted-foreground'>{transaction.category}</TableCell>
                    <TableCell className={cn('font-medium', amountColor)}>
                      {transaction.finalAmount > 0 ? '+' : ''}
                      {transaction.finalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {transaction.trip ? 'Trip' : ''}
                      {transaction.gf > 0 ? (transaction.trip ? ', ' : '') + 'GF' : ''}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
