import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Portfolio from './pages/Portfolio'

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
  return <RouterProvider router={router} />
}

export default App
