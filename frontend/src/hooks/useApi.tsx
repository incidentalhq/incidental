import { createContext, useContext, useRef } from 'react'

import { ApiService } from '@/services/api'

const useApiProvider = () => {
  const apiService = useRef(new ApiService())

  return { apiService: apiService.current }
}

// Create a type from the return values of _useDataProvider
type ApiServiceContextType = ReturnType<typeof useApiProvider>

// Main context provider
const ApiServiceContext = createContext<ApiServiceContextType | undefined>(undefined)

type Props = {
  children?: React.ReactNode
}

// Provides data for a single spreadsheet component
export const ApiServiceProvider: React.FC<Props> = ({ children }) => {
  const value = useApiProvider()
  return <ApiServiceContext.Provider value={value}>{children}</ApiServiceContext.Provider>
}

const useApiService = () => {
  const context = useContext(ApiServiceContext)

  if (context === undefined) {
    throw new Error('useAuth can only be used within an Auth context')
  }

  return context
}

export default useApiService
