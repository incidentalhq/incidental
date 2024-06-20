import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import ModalProvider from '@/components/Modal/ModalProvider'
import { ApiServiceProvider } from '@/hooks/useApi'
import { AuthProvider } from '@/hooks/useAuth'
import { GlobalProvider } from '@/hooks/useGlobal'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false
    }
  }
})

export const withAllTheProviders = (component: React.ReactElement) => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <GlobalProvider>
            <ApiServiceProvider>
              <AuthProvider>
                <ModalProvider>{component}</ModalProvider>
              </AuthProvider>
            </ApiServiceProvider>
          </GlobalProvider>
        </BrowserRouter>
        <ToastContainer hideProgressBar={true} autoClose={2000} />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </>
  )
}
