import { useCallback } from 'react'
import { generatePath, Link } from 'react-router-dom'
import styled from 'styled-components'

import home from '@/assets/icons/home.svg'
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

const SettingsSidebar: React.FC<Props> = () => {
  const { organisation } = useGlobal()

  const generateSettingsPath = useCallback(
    (path: string) => {
      return generatePath(path, { organisation: organisation!.slug })
    },
    [organisation]
  )

  return (
    <Root>
      {organisation && (
        <>
          <MenuItems>
            <BackContainer>
              <Item to={RoutePaths.DASHBOARD}>&laquo; Back to Dashboard</Item>
            </BackContainer>

            <SubMenu>
              <SubMenuTitle>
                <Icon icon={home} fixedWidth={true} /> Workspace
              </SubMenuTitle>
              <SubItems>
                <Item to={generateSettingsPath(RoutePaths.SETTINGS_INDEX)}>Overview</Item>
                <Item to={generateSettingsPath(RoutePaths.SETTINGS_SEVERITY)}>Severities</Item>
                <Item to={generateSettingsPath(RoutePaths.SETTINGS_ROLES)}>Roles</Item>
                <Item to={generateSettingsPath(RoutePaths.SETTINGS_TIMESTAMPS)}>Timestamps</Item>
                <Item to={generateSettingsPath(RoutePaths.SETTINGS_SLACK)}>Slack</Item>
              </SubItems>
            </SubMenu>
          </MenuItems>
        </>
      )}
    </Root>
  )
}

export default SettingsSidebar
