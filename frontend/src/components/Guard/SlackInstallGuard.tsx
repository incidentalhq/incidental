import { PropsWithChildren, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import useGlobal from '@/hooks/useGlobal'
import { RoutePaths } from '@/routes'

const ignorePaths = [RoutePaths.SLACK_INSTALL, RoutePaths.SLACK_INSTALL_COMPLETE]

const SlackInstallGuard: React.FC<PropsWithChildren> = ({ children }) => {
  const { organisation } = useGlobal()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (!organisation) {
      return
    }

    const ignoreCurrentPath = ignorePaths.includes(location.pathname)

    if (!organisation.slackAppInstalled && !ignoreCurrentPath) {
      setShouldRedirect(true)
      return
    }

    setShouldRedirect(false)
  }, [organisation, location.pathname])

  if (shouldRedirect) {
    return <Navigate to={RoutePaths.SLACK_INSTALL} />
  }

  return children
}

export default SlackInstallGuard
