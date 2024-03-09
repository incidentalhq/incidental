import { useQuery } from '@tanstack/react-query'
import { PropsWithChildren, useEffect } from 'react'
import { toast } from 'react-toastify'

import useApiService from '@/hooks/useApi'
import useAuth from '@/hooks/useAuth'
import useGlobal from '@/hooks/useGlobal'
import { APIError } from '@/services/transport'

type Props = PropsWithChildren

const ReadyGuard: React.FC<Props> = ({ children }) => {
  const { apiService } = useApiService()
  const { logout } = useAuth()
  const { setOrganisation, setStatusList, setSeverityList, setForms, setIncidentTypes } = useGlobal()

  const worldQuery = useQuery({
    queryKey: ['world'],
    queryFn: () => apiService.getWorld()
  })

  useEffect(() => {
    if (!worldQuery.error) {
      return
    }
    if (worldQuery.error instanceof APIError) {
      toast(worldQuery.error.detail, { type: 'error' })
    }
    logout()
    console.error(worldQuery.error)
  }, [worldQuery.error, logout])

  useEffect(() => {
    if (worldQuery.isSuccess) {
      setOrganisation(worldQuery.data.organisations[0]) //TODO: support multi organisations
      setStatusList(worldQuery.data.statusList)
      setSeverityList(worldQuery.data.severityList)
      setForms(worldQuery.data.forms)
      setIncidentTypes(worldQuery.data.incidentTypes)
    }
  }, [
    worldQuery.data,
    worldQuery.isSuccess,
    setOrganisation,
    setStatusList,
    setSeverityList,
    setForms,
    setIncidentTypes
  ])

  if (!worldQuery.isFetched) {
    return <p>Loading</p>
  }

  return children
}

export default ReadyGuard
