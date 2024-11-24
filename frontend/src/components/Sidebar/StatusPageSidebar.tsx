import { Link, useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'

import gear from '@/assets/icons/gear.svg'
import traffic from '@/assets/icons/traffic.svg'
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

const StatusPageSidebar: React.FC<Props> = () => {
  const { id } = useParams() as { id: string }

  return (
    <Root>
      <MenuItems>
        <BackContainer>
          <BackLink to={RoutePaths.DASHBOARD}>Back to Dashboard</BackLink>
        </BackContainer>

        <SubMenu>
          <SubMenuTitle>
            <Icon icon={traffic} fixedWidth={true} /> Status Page
          </SubMenuTitle>
          <SubItems>
            <MenuItem to={RoutePaths.STATUS_PAGE_SHOW} pathParams={{ id }}>
              Overview
            </MenuItem>
            <MenuItem to={RoutePaths.STATUS_PAGE_ALL_INCIDENTS} pathParams={{ id }}>
              All incidents
            </MenuItem>
          </SubItems>
        </SubMenu>

        <SubMenu>
          <SubMenuTitle>
            <Icon icon={gear} fixedWidth={true} /> Settings
          </SubMenuTitle>
          <SubItems>
            <MenuItem to={RoutePaths.STATUS_PAGE_SETTINGS_BASIC} pathParams={{ id }}>
              Basic
            </MenuItem>
            <MenuItem to={RoutePaths.STATUS_PAGE_SETTINGS_CUSTOM_DOMAIN} pathParams={{ id }}>
              Custom domain
            </MenuItem>
          </SubItems>
        </SubMenu>
      </MenuItems>
    </Root>
  )
}

export default StatusPageSidebar
