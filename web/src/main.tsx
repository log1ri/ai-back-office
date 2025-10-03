import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { queryClient } from './lib/query-client'
import { routeTree } from './routeTree.gen'
import { SubIdProvider } from './contexts/SubIdContext'
import ErrorBoundary from './components/ErrorBoundary'

const router = createRouter({ 
  routeTree,
  defaultNotFoundComponent: () => (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/login" style={{ color: '#007bff', textDecoration: 'underline' }}>
        Go back to login
      </a>
    </div>
  ),
  defaultErrorComponent: ({ error }) => (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>Something went wrong!</h1>
      <p>{error?.message || 'An unexpected error occurred'}</p>
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            marginRight: '10px', 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Reload Page
        </button>
        <a 
          href="/login" 
          style={{ 
            color: '#007bff', 
            textDecoration: 'underline',
            padding: '8px 16px'
          }}
        >
          Go back to login
        </a>
      </div>
    </div>
  )
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
const root = ReactDOM.createRoot(rootElement)
root.render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SubIdProvider>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </SubIdProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)