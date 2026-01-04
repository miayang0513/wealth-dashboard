import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/transactions', label: 'Transactions' },
    { path: '/portfolio', label: 'Portfolio' },
  ]

  return (
    <div className='min-h-screen bg-background'>
      <nav className='border-b'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex space-x-1'>
            {navItems.map(item => (
              <Button
                key={item.path}
                asChild
                variant={location.pathname === item.path ? 'default' : 'ghost'}
                className={cn(
                  'rounded-none border-b-2 border-transparent',
                  location.pathname === item.path && 'border-primary'
                )}
              >
                <Link to={item.path}>{item.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </nav>
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>{children}</main>
    </div>
  )
}
