import { Overview, CategoryBreakdown } from '@/models/overview'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TransactionOverviewProps {
  overview: Overview
}

interface PieDataItem {
  name: string
  value: number
  percentage: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658']

export default function TransactionOverview({ overview }: TransactionOverviewProps) {
  const pieData: PieDataItem[] = overview.categoryBreakdown.map((item: CategoryBreakdown) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage.toFixed(1),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card className='bg-blue-50 dark:bg-blue-950/20'>
            <CardContent className='pt-6'>
              <div className='mb-1 text-sm text-muted-foreground'>Total Income</div>
              <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>{overview.totalIncome.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className='bg-red-50 dark:bg-red-950/20'>
            <CardContent className='pt-6'>
              <div className='mb-1 text-sm text-muted-foreground'>Total Expense</div>
              <div className='text-2xl font-bold text-red-600 dark:text-red-400'>{overview.totalExpense.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className='bg-green-50 dark:bg-green-950/20'>
            <CardContent className='pt-6'>
              <div className='mb-1 text-sm text-muted-foreground'>Net</div>
              <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                {(overview.totalIncome - overview.totalExpense).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {overview.categoryBreakdown.length > 0 && (
          <div>
            <h3 className='mb-4 text-lg font-semibold'>Category Breakdown (Expense Only)</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {pieData.map((_: PieDataItem, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div className='space-y-2'>
                  {overview.categoryBreakdown.map((item: CategoryBreakdown) => (
                    <div key={item.category} className='flex items-center justify-between rounded-lg border p-3'>
                      <span className='text-sm font-medium'>{item.category}</span>
                      <div className='text-right'>
                        <div className='text-sm font-semibold'>{item.amount.toFixed(2)}</div>
                        <div className='text-xs text-muted-foreground'>{item.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
