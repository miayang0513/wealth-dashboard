import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Portfolio from './pages/Portfolio'
import { useCurrencyStore } from './store/currencyStore'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Dashboard />
      </Layout>
    ),
  },
  {
    path: '/transactions',
    element: (
      <Layout>
        <Transactions />
      </Layout>
    ),
  },
  {
    path: '/portfolio',
    element: (
      <Layout>
        <Portfolio />
      </Layout>
    ),
  },
])

function App() {
  const fetchRates = useCurrencyStore(state => state.fetchRates)

  // Initialize exchange rates for ExchangeRates component display
  // This ensures ExchangeRates always has data, even when not on Transactions page
  useEffect(() => {
    fetchRates(['USD', 'TWD'])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  return <RouterProvider router={router} />
}

export default App
