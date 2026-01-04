import { Transaction, getTransactionType } from '@/models/transaction'

interface TransactionTableProps {
  transactions: Transaction[]
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>Date</th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Item Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Category
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>Amount</th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>Notes</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className='px-6 py-4 text-center text-gray-500'>
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction, index) => {
                const type = getTransactionType(transaction)
                const amountColor =
                  type === 'income' ? 'text-green-600' : type === 'expense' ? 'text-red-600' : 'text-gray-600'

                return (
                  <tr key={index} className='hover:bg-gray-50'>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-900'>{transaction.date}</td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-900'>{transaction.itemName}</td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>{transaction.category}</td>
                    <td className={`whitespace-nowrap px-6 py-4 text-sm font-medium ${amountColor}`}>
                      {transaction.finalAmount > 0 ? '+' : ''}
                      {transaction.finalAmount.toFixed(2)}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500'>
                      {transaction.trip ? 'Trip' : ''}
                      {transaction.gf > 0 ? (transaction.trip ? ', ' : '') + 'GF' : ''}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
