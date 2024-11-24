import { FormikHelpers } from 'formik'
import { useMemo } from 'react'
import styled from 'styled-components'

import bolt from '@/assets/icons/bolt.svg'
import gear from '@/assets/icons/gear.svg'
import home from '@/assets/icons/home.svg'
import traffic from '@/assets/icons/traffic.svg'
import Icon from '@/components/Icon/Icon'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { RoutePaths } from '@/routes'
import { IUser } from '@/types/models'
import { PREF_SELECTED_ORGANISATION, setPreference } from '@/utils/storage'

import SwitchOrganisationForm, { FormValues as SwitchOrganisationFormValues } from '../Sections/SwitchOrganisationForm'
import MenuItem from './MenuItem'

const Root = styled.div`
  align-items: center;
`

const MenuItems = styled.div`
  padding: 0;
  margin: 0;
`

const SwitchOrganisationWrapper = styled.div`
  margin-bottom: 1rem;
`

interface Props {
  user: IUser
}

const DefaultSideBar: React.FC<Props> = () => {
  const { organisationDetails, organisation, setCurrentOrganisation } = useGlobal()
  const { apiService } = useApiService()

  const handleSubmit = async (
    values: SwitchOrganisationFormValues,
    helpers: FormikHelpers<SwitchOrganisationFormValues>
  ) => {
    helpers.setSubmitting(false)
    const organisationDetail = organisationDetails.find((it) => it.organisation.id === values.organisationId)
    if (!organisationDetail) {
      return
    }
    setPreference(PREF_SELECTED_ORGANISATION, organisationDetail.organisation.id)
    setCurrentOrganisation(organisationDetail)
    apiService.setOrganisation(organisationDetail.organisation.id)
  }

  const organisations = useMemo(() => organisationDetails.map((it) => it.organisation), [organisationDetails])

  return (
    <Root>
      {organisation && (
        <>
          <SwitchOrganisationWrapper>
            <SwitchOrganisationForm
              onSubmit={handleSubmit}
              organisations={organisations}
              currentOrganisation={organisation}
            />
          </SwitchOrganisationWrapper>
          <MenuItems>
            <MenuItem to={RoutePaths.DASHBOARD}>
              <Icon icon={home} fixedWidth /> Dashboard
            </MenuItem>
            <MenuItem to={RoutePaths.INCIDENTS}>
              <Icon icon={bolt} fixedWidth /> Incidents
            </MenuItem>
            <MenuItem to={RoutePaths.STATUS_PAGES_LIST}>
              <Icon icon={traffic} fixedWidth /> Status page
            </MenuItem>
            <MenuItem to={RoutePaths.SETTINGS_INDEX}>
              <Icon icon={gear} fixedWidth /> Settings
            </MenuItem>
          </MenuItems>
        </>
      )}
    </Root>
  )
}

export default DefaultSideBar
