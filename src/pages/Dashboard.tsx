import { Card, CardContent } from '@/components/ui/card'

export default function Dashboard() {
  return (
    <div>
      <h1 className='mb-4 text-3xl font-bold tracking-tight'>Dashboard</h1>
      <Card>
        <CardContent className='pt-6'>
          <p className='text-muted-foreground'>此階段先不實作，僅保留 router 與頁面骨架。</p>
        </CardContent>
      </Card>
    </div>
  )
}
