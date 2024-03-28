import { Link } from 'react-router-dom'
import styled from 'styled-components'

import Dropdown from '@/components/Dropdown/Dropdown'
import useAuth from '@/hooks/useAuth'
import { IUser } from '@/types/models'

const Root = styled.div`
  display: flex;
  margin: 1rem 0 1rem;
  justify-content: space-between;
`
const MenuItem = styled.div`
  a {
    padding: 0.25rem 0.5rem;
    display: block;
    color: var(--color-gray-600);
    &:hover {
      background-color: var(--color-gray-100);
    }
  }
`
const NavbarItems = styled.div``

interface Props {
  user: IUser
}

const Header: React.FC<Props> = ({ user }) => {
  const { logout } = useAuth()

  const handleClickLogout = () => logout()

  return (
    <Root>
      <div>Welcome back {user.name}</div>
      <NavbarItems>
        <Dropdown label="Account" closeOnClick={true}>
          <MenuItem>
            <Link to={`/profile`}>Profile</Link>
          </MenuItem>
          <MenuItem>
            <Link onClick={handleClickLogout} to={''}>
              Logout
            </Link>
          </MenuItem>
        </Dropdown>
      </NavbarItems>
    </Root>
  )
}

export default Header
