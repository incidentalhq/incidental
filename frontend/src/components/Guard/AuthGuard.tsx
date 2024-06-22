import { PropsWithChildren, useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import useApiService from '@/hooks/useApi'
import useAuth from '@/hooks/useAuth'
import { RoutePaths } from '@/routes'
import { APIError } from '@/services/transport'
import { ErrorCodes } from '@/types/core'
import { clearUserDataFromBrowser, getAuthFromBrowser } from '@/utils/storage'

const AuthGuard: React.FC<PropsWithChildren> = ({ children }) => {
  const [redirect, setRedirect] = useState(false)
  const cookieData = getAuthFromBrowser()
  const location = useLocation()
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const { apiService } = useApiService()

  useEffect(() => {
    // load user info from local storage
    if (cookieData && !user) {
      setUser(cookieData)
      apiService.setCurrentUser(cookieData)

      // logout user if locally stored credentials are invalid
      apiService.getMe().then(
        () => {},
        (r) => {
          if (r instanceof APIError) {
            if (r.code === ErrorCodes.INVALID_AUTH_TOKEN) {
              clearUserDataFromBrowser()
              apiService.setCurrentUser(undefined)
              // hard redirect
              window.location.reload()
            }
          }
        }
      )

      // if we're on the login page, but have authenticated then redirect to root page
      if (location.pathname === RoutePaths.LOGIN) {
        navigate('/')
      }
    }

    // redirect to login page
    if (!user && !cookieData) {
      setRedirect(true)
    }
  }, [cookieData, user, setUser, navigate, location.pathname, apiService])

  if (redirect) {
    return <Navigate to={RoutePaths.LOGIN} />
  }

  if (!user) {
    return null
  }

  return children
}

export default AuthGuard
