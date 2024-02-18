import { faBoltLightning, faCog, faHome } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styled, { css, keyframes } from 'styled-components'

import logo from '@/assets/mark_noborder.png'
import { RoutePaths } from '@/routes'
import { IUser } from '@/types/models'

const rotate = keyframes`
  100% {
		transform: rotate(1turn);
	}
`

const borderCss = css`
  overflow: hidden;
  z-index: 0;
  &::before {
    content: '';
    position: absolute;
    z-index: -2;
    left: -50%;
    top: -50%;
    width: 200%;
    height: 200%;
    background-color: #399953;
    background-repeat: no-repeat;
    background-size:
      50% 50%,
      50% 50%;
    background-position:
      0 0,
      100% 0,
      100% 100%,
      0 100%;

    background-image: linear-gradient(#399953, #399953), linear-gradient(#fbb300, #fbb300),
      linear-gradient(#d53e33, #d53e33), linear-gradient(#377af5, #377af5);
    animation: ${rotate} 4s linear infinite;
  }

  &::after {
    content: '';
    position: absolute;
    z-index: -1;
    left: 6px;
    top: 6px;
    width: calc(100% - 12px);
    height: calc(100% - 12px);
    background: white;
    border-radius: 10px;
  }
`

const Root = styled.div`
  align-items: center;
`
const LogoSection = styled.div`
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Logo = styled.img`
  display: block;
  width: 64px;
  height: 64px;
  border-radius: 1rem;
`

interface LogoImageProps {
  $animate: boolean
}

const LogoWrapper = styled.div<LogoImageProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  ${(props) => (props.$animate ? borderCss : undefined)}
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
