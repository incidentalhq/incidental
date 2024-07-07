import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

import SettingsSidebar from '@/components/Sections/SettingsSidebar'
import useAuth from '@/hooks/useAuth'

const Container = styled.div`
  display: flex;
  margin: 0 auto;
  width: 100%;
`
const RightColumn = styled.div`
  background: #fff;
  flex: 1;
  margin-top: 8px;
  border-top: 1px solid var(--color-gray-200);
  border-left: 1px solid var(--color-gray-200);
  border-radius: 4px 0 0 0;
`
const LeftColumn = styled.div`
  padding: 1rem;
  width: 220px;
  height: 100vh;
`

const SettingsLayout = () => {
  const { user } = useAuth()

  if (!user) {
    return <>User not found</>
  }

  return (
    <Container>
      <LeftColumn>
        <SettingsSidebar user={user} />
      </LeftColumn>
      <RightColumn>
        <Outlet />
      </RightColumn>
    </Container>
  )
}

export default SettingsLayout
