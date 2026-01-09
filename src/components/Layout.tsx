import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ExchangeRates from '@/components/ExchangeRates'
import { Home, Wallet, User } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/transactions', label: 'Transactions', icon: Wallet },
    { path: '/portfolio', label: 'Portfolio', icon: User },
  ]

  return (
    <div className='min-h-screen bg-background'>
      {/* Top Exchange Rates Bar - Always visible, smaller on mobile */}
      <div className='fixed top-0 left-0 right-0 z-50 border-b bg-background md:hidden'>
        <div className='mx-auto max-w-7xl px-2 py-1'>
          <ExchangeRates compact />
        </div>
      </div>

      {/* Desktop Top Navigation */}
      <nav className='fixed top-0 left-0 right-0 z-50 hidden border-b bg-background md:block'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-2'>
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
            <ExchangeRates />
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className='fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden'>
        <div className='mx-auto flex items-center justify-around px-2 py-2'>
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center rounded-lg px-2 py-2 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className='h-5 w-5' />
                <span className='mt-1 text-[10px] font-medium'>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className='mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 md:pb-8 md:pt-16 lg:px-8'>
        {children}
      </main>
    </div>
  )
}
