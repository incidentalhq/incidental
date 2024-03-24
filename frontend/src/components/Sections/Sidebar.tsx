import { faBoltLightning, faCog, faHome } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormikHelpers } from 'formik'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { generatePath } from 'react-router-dom'
import styled from 'styled-components'

import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { RoutePaths } from '@/routes'
import { IUser } from '@/types/models'
import { PREF_SELECTED_ORGANISATION, setPreference } from '@/utils/storage'

import SwitchOrganisationForm, { FormValues as SwitchOrganisationFormValues } from './SwitchOrganisationForm'

const Root = styled.div`
  align-items: center;
`

const MenuItems = styled.div`
  padding: 0;
  margin: 0;
`
const Item = styled(Link)`
  display: block;
  color: #1f4d63;
  text-decoration: none;
  margin-bottom: 1rem;

  &:visited {
    color: #1f4d63;
  }

  &:hover {
    color: var(--color-blue-700);
  }
`
const SwitchOrganisationWrapper = styled.div`
  margin-bottom: 1rem;
`

interface Props {
  user: IUser
}

const SideBar: React.FC<Props> = () => {
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
            <Item to={RoutePaths.DASHBOARD}>
              <FontAwesomeIcon icon={faHome} fixedWidth={true} /> Dashboard
            </Item>
            <Item to={RoutePaths.INCIDENTS}>
              <FontAwesomeIcon icon={faBoltLightning} fixedWidth={true} /> Incidents
            </Item>
            <Item to={generatePath(RoutePaths.SETTINGS_INDEX, { organisation: organisation!.slug })}>
              <FontAwesomeIcon icon={faCog} fixedWidth={true} /> Settings
            </Item>
          </MenuItems>
        </>
      )}
    </Root>
  )
}

export default SideBar
