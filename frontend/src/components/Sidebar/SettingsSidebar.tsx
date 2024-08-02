import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

import home from '@/assets/icons/home.svg'
import puzzle from '@/assets/icons/puzzle.svg'
import Icon from '@/components/Icon/Icon'
import { RoutePaths } from '@/routes'
import { IUser } from '@/types/models'

import MenuItem, { MenuItemRoot } from './MenuItem'

const Root = styled.div`
  align-items: center;
`

const MenuItems = styled.div`
  padding: 0;
  margin: 0;
`
interface ItemProps {
  $selected?: boolean
}

const onSelectCss = css`
  background-color: var(--color-gray-100);
`
const BackContainer = styled.div`
  margin-left: calc(16px + 1rem);
`
const BackLink = styled(Link)<ItemProps>`
  display: block;
  text-decoration: none;
  padding: 0.25rem 8px;
  border-radius: 0.4rem;
  margin-bottom: 1px;

  &:hover {
    background-color: var(--color-gray-100);
  }

  ${(props) => props.$selected && onSelectCss}
`
const SubMenu = styled.div`
  margin-top: 1rem;
`
const SubMenuTitle = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0 8px;
`
const SubItems = styled.div`
  margin-top: 0.5rem;

  > ${MenuItemRoot} {
    margin-left: calc(16px + 1rem);
  }
`

interface Props {
  user: IUser
}

const SettingsSidebar: React.FC<Props> = () => {
  return (
    <Root>
      <MenuItems>
        <BackContainer>
          <BackLink to={RoutePaths.DASHBOARD}>Back to Dashboard</BackLink>
        </BackContainer>

        <SubMenu>
          <SubMenuTitle>
            <Icon icon={home} fixedWidth={true} /> Workspace
          </SubMenuTitle>
          <SubItems>
            <MenuItem to={RoutePaths.SETTINGS_INDEX}>Overview</MenuItem>
            <MenuItem to={RoutePaths.SETTINGS_FIELDS}>Custom fields</MenuItem>
            <MenuItem to={RoutePaths.SETTINGS_FORMS_INDEX}>Forms</MenuItem>
            <MenuItem to={RoutePaths.SETTINGS_ROLES}>Roles</MenuItem>
            <MenuItem to={RoutePaths.SETTINGS_SEVERITY}>Severities</MenuItem>
            <MenuItem to={RoutePaths.SETTINGS_STATUSES}>Status</MenuItem>
            <MenuItem to={RoutePaths.SETTINGS_TIMESTAMPS}>Timestamps</MenuItem>
            <MenuItem to={RoutePaths.SETTINGS_TYPES}>Types</MenuItem>
          </SubItems>
        </SubMenu>

        <SubMenu>
          <SubMenuTitle>
            <Icon icon={puzzle} fixedWidth={true} /> Integrations
          </SubMenuTitle>
          <SubItems>
            <MenuItem to={RoutePaths.SETTINGS_SLACK}>Slack</MenuItem>
          </SubItems>
        </SubMenu>
      </MenuItems>
    </Root>
  )
}

export default SettingsSidebar
