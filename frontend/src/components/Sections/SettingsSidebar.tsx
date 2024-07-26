import { generatePath, Link, useMatch } from 'react-router-dom'
import styled, { css } from 'styled-components'

import home from '@/assets/icons/home.svg'
import puzzle from '@/assets/icons/puzzle.svg'
import Icon from '@/components/Icon/Icon'
import useGlobal from '@/hooks/useGlobal'
import { RoutePaths } from '@/routes'
import { IUser } from '@/types/models'

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

const onSelectItem = css`
  background-color: var(--color-gray-100);
  border-radius: 0.4rem;
`

const Item = styled(Link)<ItemProps>`
  display: block;
  color: #1f4d63;
  text-decoration: none;
  margin-bottom: 1rem;
  padding: 0.25rem 0.5rem;

  &:visited {
    color: #1f4d63;
  }

  &:hover {
    color: var(--color-blue-700);
  }

  ${(props) => props.$selected && onSelectItem}
`
const SubMenu = styled.div`
  margin-top: 1rem;
`
const SubMenuTitle = styled.div``
const SubItems = styled.div`
  margin-top: 0.5rem;
  margin-left: 20px;

  > ${Item} {
    margin-bottom: 0.5rem;
  }
`
const BackContainer = styled.div`
  height: 34.5px;
`

interface Props {
  user: IUser
}

interface MenuItemProps {
  to: RoutePaths
}

const MenuItem: React.FC<MenuItemProps & React.PropsWithChildren> = ({ to, children }) => {
  const match = useMatch(to)
  const { organisation } = useGlobal()

  // This should not happen
  if (!organisation) {
    return null
  }

  return (
    <Item to={generatePath(to, { organisation: organisation.slug, id: '' })} $selected={match ? true : false}>
      {children}
    </Item>
  )
}

const SettingsSidebar: React.FC<Props> = () => {
  return (
    <Root>
      <MenuItems>
        <BackContainer>
          <Item to={RoutePaths.DASHBOARD}>&laquo; Back to Dashboard</Item>
        </BackContainer>

        <SubMenu>
          <SubMenuTitle>
            <Icon icon={home} fixedWidth={true} /> Workspace
          </SubMenuTitle>
          <SubItems>
            <MenuItem to={RoutePaths.SETTINGS_INDEX}>Overview</MenuItem>
            <MenuItem to={RoutePaths.SETTINGS_FIELDS}>Custom fields</MenuItem>
            <MenuItem to={RoutePaths.SETTINGS_ROLES}>Roles</MenuItem>
            <MenuItem to={RoutePaths.SETTINGS_SEVERITY}>Severities</MenuItem>
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
