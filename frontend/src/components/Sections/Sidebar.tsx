import { faBoltLightning, faCog, faHome } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import logo from '@/assets/mark_noborder.png'
import { RoutePaths } from '@/routes'
import { IUser } from '@/types/models'

const Root = styled.div`
  align-items: center;
`
const LogoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const Logo = styled.img`
  display: block;
  width: 32px;
  height: 32px;
`

interface LogoImageProps {
  $animate: boolean
}

const LogoWrapper = styled.div<LogoImageProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 1rem;
  width: 70px;
  height: 70px;
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

interface Props {
  user: IUser
}

const SideBar: React.FC<Props> = () => {
  const location = useLocation()
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
    setTimeout(() => setAnimate(false), 2000)
  }, [location.pathname])

  return (
    <Root>
      <LogoSection>
        <Link to={RoutePaths.DASHBOARD}>
          <LogoWrapper $animate={animate}>
            <Logo src={logo} />
          </LogoWrapper>
        </Link>
      </LogoSection>
      <MenuItems>
        <Item to={RoutePaths.DASHBOARD}>
          <FontAwesomeIcon icon={faHome} fixedWidth={true} /> Dashboard
        </Item>
        <Item to={RoutePaths.INCIDENTS}>
          <FontAwesomeIcon icon={faBoltLightning} fixedWidth={true} /> Incidents
        </Item>
        <Item to={RoutePaths.SETTINGS}>
          <FontAwesomeIcon icon={faCog} fixedWidth={true} /> Settings
        </Item>
      </MenuItems>
    </Root>
  )
}

export default SideBar
