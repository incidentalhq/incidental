import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import Debug from '@/components/Debug/Debug'
// components
import AuthGuard from '@/components/Guard/AuthGuard'
import ReadyGuard from '@/components/Guard/ReadyGuard'
import SlackInstallGuard from '@/components/Guard/SlackInstallGuard'
import DefaultLayout from '@/components/Layout/DefaultLayout'
import SettingsLayout from '@/components/Layout/SettingsLayout'
import StatusPageLayout from '@/components/Layout/StatusPageLayout'
import ModalProvider from '@/components/Modal/ModalProvider'
// hooks
import { ApiServiceProvider } from '@/hooks/useApi'
import { AuthProvider } from '@/hooks/useAuth'
import { GlobalProvider } from '@/hooks/useGlobal'
// pages
import Login from '@/pages/Auth/EmailLogin'
import LoginSelector from '@/pages/Auth/LoginSelector'
import Register from '@/pages/Auth/Register'
import VerifySendCode from '@/pages/Auth/SendCode'
import SlackLogin from '@/pages/Auth/SlackLogin'
import RegisterSuccess from '@/pages/Auth/Success'
import Verify from '@/pages/Auth/Verify'
import Dashboard from '@/pages/Dashboard/Dashboard'
import PageNotFound from '@/pages/Error/PageNotFound'
import IncidentsList from '@/pages/Incidents/List'
import ShowIncident from '@/pages/Incidents/Show'
import OAuthComplete from '@/pages/OAuth/Complete'
import SettingsFields from '@/pages/Settings/Fields'
import SettingsFormsEdit from '@/pages/Settings/Forms/Edit'
import SettingsForms from '@/pages/Settings/Forms/Index'
import SettingsIndex from '@/pages/Settings/Index'
import SettingsMembers from '@/pages/Settings/Members'
import SettingsRoles from '@/pages/Settings/Roles'
import SettingsSeverity from '@/pages/Settings/Severity'
import SettingsSlack from '@/pages/Settings/Slack'
import SettingsStatuses from '@/pages/Settings/Statuses'
import SettingsTimestamps from '@/pages/Settings/Timestamps'
import SettingsIncidentTypes from '@/pages/Settings/Types'
import SlackInstallComplete from '@/pages/Slack/Complete'
import SlackInstall from '@/pages/Slack/Install'
import ShowStatusPage from '@/pages/StatusPages/ShowStatusPage'
import ShowStatusPageIncident from '@/pages/StatusPages/ShowStatusPageIncident'
import StatusPageListIncidents from '@/pages/StatusPages/StatusPageListIncidents'
import StatusPagesList from '@/pages/StatusPages/StatusPagesList'
// route definitions
import { RoutePaths } from '@/routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

const AuthenticatedRoutes = () => (
  <AuthGuard>
    <ReadyGuard>
      <SlackInstallGuard>
        <Outlet />
      </SlackInstallGuard>
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
              <ModalProvider>
                <Routes>
                  <Route path={RoutePaths.LOGIN} element={<LoginSelector />} />
                  <Route path={RoutePaths.EMAIL_LOGIN} element={<Login />} />
                  <Route path={RoutePaths.SLACK_LOGIN} element={<SlackLogin />} />
                  <Route path={RoutePaths.REGISTER} element={<Register />} />
                  <Route path={RoutePaths.REGISTER_SUCCESS} element={<RegisterSuccess />} />
                  <Route path={RoutePaths.OAUTH_COMPLETE} element={<OAuthComplete />} />
                  <Route path={RoutePaths.VERIFY_ACCOUNT} element={<Verify />} />
                  <Route path={RoutePaths.VERIFY_SEND_CODE} element={<VerifySendCode />} />
                  <Route element={<AuthenticatedRoutes />}>
                    <Route element={<DefaultLayout />}>
                      <Route path={RoutePaths.DASHBOARD} element={<Dashboard />} />
                      <Route path={RoutePaths.INCIDENTS} element={<IncidentsList />} />
                      <Route path={RoutePaths.SHOW_INCIDENT} element={<ShowIncident />} />
                      <Route path={RoutePaths.SLACK_INSTALL} element={<SlackInstall />} />
                      <Route path={RoutePaths.SLACK_INSTALL_COMPLETE} element={<SlackInstallComplete />} />
                      <Route path={RoutePaths.STATUS_PAGES_LIST} element={<StatusPagesList />} />
                    </Route>
                    <Route element={<StatusPageLayout />}>
                      <Route path={RoutePaths.STATUS_PAGE_SHOW} element={<ShowStatusPage />} />
                      <Route path={RoutePaths.STATUS_PAGE_ALL_INCIDENTS} element={<StatusPageListIncidents />} />
                      <Route path={RoutePaths.STATUS_PAGE_SHOW_INCIDENT} element={<ShowStatusPageIncident />} />
                    </Route>
                    <Route element={<SettingsLayout />}>
                      <Route path={RoutePaths.SETTINGS_INDEX} element={<SettingsIndex />} />
                      <Route path={RoutePaths.SETTINGS_SEVERITY} element={<SettingsSeverity />} />
                      <Route path={RoutePaths.SETTINGS_TIMESTAMPS} element={<SettingsTimestamps />} />
                      <Route path={RoutePaths.SETTINGS_SLACK} element={<SettingsSlack />} />
                      <Route path={RoutePaths.SETTINGS_ROLES} element={<SettingsRoles />} />
                      <Route path={RoutePaths.SETTINGS_FIELDS} element={<SettingsFields />} />
                      <Route path={RoutePaths.SETTINGS_TYPES} element={<SettingsIncidentTypes />} />
                      <Route path={RoutePaths.SETTINGS_FORMS_INDEX} element={<SettingsForms />} />
                      <Route path={RoutePaths.SETTINGS_FORMS_EDIT} element={<SettingsFormsEdit />} />
                      <Route path={RoutePaths.SETTINGS_STATUSES} element={<SettingsStatuses />} />
                      <Route path={RoutePaths.SETTINGS_USERS} element={<SettingsMembers />} />
                    </Route>
                  </Route>
                  <Route path="*" element={<PageNotFound />} />
                </Routes>
                <Debug />
              </ModalProvider>
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
