import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import AuthGuard from '@/components/Guard/AuthGuard'
import ReadyGuard from '@/components/Guard/ReadyGuard'
import DefaultLayout from '@/components/Layout/DefaultLayout'
import { ApiServiceProvider } from '@/hooks/useApi'
import { AuthProvider } from '@/hooks/useAuth'
import { GlobalProvider } from '@/hooks/useGlobal'
import Dashboard from '@/pages/Dashboard/Dashboard'
import Login from '@/pages/Login/Login'
import Register from '@/pages/Register/Register'
import RegisterSuccess from '@/pages/Register/Success'

import IncidentsList from './pages/Incidents/List'
import ShowIncident from './pages/Incidents/Show'
import OAuthComplete from './pages/OAuth/Complete'
import SettingsIndex from './pages/Settings'
import { RoutePaths } from './routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

const DefaultLayoutRoutes = () => (
  <DefaultLayout>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path={RoutePaths.INCIDENTS} element={<IncidentsList />} />
      <Route path={RoutePaths.SHOW_INCIDENT} element={<ShowIncident />} />
      <Route path={RoutePaths.SETTINGS} element={<SettingsIndex />} />
    </Routes>
  </DefaultLayout>
)

const AuthenticatedRoutes = () => (
  <AuthGuard>
    <ReadyGuard>
      <Routes>
        <Route path="/*" element={<DefaultLayoutRoutes />} />
      </Routes>
    </ReadyGuard>
  </AuthGuard>
)

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GlobalProvider>
          <ApiServiceProvider>
            <AuthProvider>
              <Routes>
                <Route path={RoutePaths.LOGIN} element={<Login />} />
                <Route path={RoutePaths.REGISTER} element={<Register />} />
                <Route path={RoutePaths.OAUTH_COMPLETE} element={<OAuthComplete />} />
                <Route path={RoutePaths.REGISTER_SUCCESS} element={<RegisterSuccess />} />
                <Route path="/*" element={<AuthenticatedRoutes />} />
              </Routes>
            </AuthProvider>
          </ApiServiceProvider>
        </GlobalProvider>
      </BrowserRouter>
      <ToastContainer hideProgressBar={true} autoClose={2000} />
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}

export default App
