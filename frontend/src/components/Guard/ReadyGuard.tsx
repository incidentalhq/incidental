import { useQuery } from '@tanstack/react-query'
import { PropsWithChildren, useEffect } from 'react'

import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { getPreference, PREF_SELECTED_ORGANISATION } from '@/utils/storage'

type Props = PropsWithChildren

const ReadyGuard: React.FC<Props> = ({ children }) => {
  const { apiService } = useApiService()
  const { setCurrentOrganisation, setOrganisationDetails, organisationDetails } = useGlobal()

  const worldQuery = useQuery({
    queryKey: ['world'],
    queryFn: () => apiService.getWorld()
  })

  useEffect(() => {
    if (worldQuery.status !== 'success') {
      return
    }
    setOrganisationDetails(worldQuery.data.organisationDetails)

    const selectedOrganisationId = getPreference<string>(PREF_SELECTED_ORGANISATION)

    // fallback to first organisation if user hasn't picked an organisation
    if (!selectedOrganisationId) {
      const first = worldQuery.data.organisationDetails[0]
      setCurrentOrganisation(first)
      apiService.setOrganisation(first.organisation.id)
      return
    }

    // otherwise set current organisation based on their preference
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
  }, [worldQuery, setCurrentOrganisation, setOrganisationDetails, apiService])

  if (worldQuery.status === 'error') {
    return <p>There was an error loading the application.</p>
  }

  if (worldQuery.status === 'pending' || organisationDetails.length === 0) {
    return <p>Loading</p>
  }

  return children
}

export default ReadyGuard
