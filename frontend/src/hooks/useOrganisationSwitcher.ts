import { useCallback } from 'react'

import { IOrganisation } from '@/types/models'
import { PREF_SELECTED_ORGANISATION, setPreference } from '@/utils/storage'

import useApiService from './useApi'
import useGlobal from './useGlobal'

export const useOrganisationSwitcher = () => {
  const { setCurrentOrganisation, organisationDetails } = useGlobal()
  const { apiService } = useApiService()

  const switchOrganisation = useCallback(
    (organisation: IOrganisation) => {
      const detail = organisationDetails.find((it) => it.organisation.id === organisation.id)
      if (!detail) {
        throw new Error('Could not find organisation')
      }

      setPreference(PREF_SELECTED_ORGANISATION, organisation.id)
      setCurrentOrganisation(detail)
      apiService.setOrganisation(organisation.id)
    },
    [organisationDetails, apiService, setCurrentOrganisation]
  )

  return { switchOrganisation }
}
