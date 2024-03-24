import { useQuery } from '@tanstack/react-query'
import { PropsWithChildren, useEffect } from 'react'
import { toast } from 'react-toastify'

import useApiService from '@/hooks/useApi'
import useAuth from '@/hooks/useAuth'
import useGlobal from '@/hooks/useGlobal'
import { APIError } from '@/services/transport'
import { getPreference, PREF_SELECTED_ORGANISATION } from '@/utils/storage'

type Props = PropsWithChildren

const ReadyGuard: React.FC<Props> = ({ children }) => {
  const { apiService } = useApiService()
  const { logout } = useAuth()
  const { setCurrentOrganisation, setOrganisationDetails } = useGlobal()

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
    if (!worldQuery.isSuccess) {
      return
    }

    setOrganisationDetails(worldQuery.data.organisationDetails)

    const selectedOrganisationId = getPreference<string>(PREF_SELECTED_ORGANISATION)

    // fallback to first organisation
    if (!selectedOrganisationId) {
      const first = worldQuery.data.organisationDetails[0]
      setCurrentOrganisation(first)
      apiService.setOrganisation(first.organisation.id)
      return
    }

    const organisationDetail = worldQuery.data.organisationDetails.find(
      (it) => it.organisation.id === selectedOrganisationId
    )
    if (organisationDetail) {
      setCurrentOrganisation(organisationDetail)
      apiService.setOrganisation(organisationDetail.organisation.id)
      console.log('Selecting organisation via preferences', selectedOrganisationId)
    } else {
      const first = worldQuery.data.organisationDetails[0]
      setCurrentOrganisation(first)
      apiService.setOrganisation(first.organisation.id)
    }
  }, [worldQuery.data, worldQuery.isSuccess, setCurrentOrganisation, setOrganisationDetails, apiService])

  if (!worldQuery.isFetched) {
    return <p>Loading</p>
  }

  return children
}

export default ReadyGuard
