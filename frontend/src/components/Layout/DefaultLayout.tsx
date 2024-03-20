import styled from 'styled-components'

import useAuth from '@/hooks/useAuth'

import SideBar from '../Sections/Sidebar'

const Container = styled.div`
  display: flex;
  margin: 0 auto;
  width: 100%;
`

const Content = styled.div``

const RightColumn = styled.div`
  background: #fff;
  flex: 1;
`

const LeftColumn = styled.div`
  padding: 1rem;
  width: 220px;
  border-right: 1px solid var(--color-gray-200);
  height: 100vh;
`

type Props = {
  children?: React.ReactNode
}

const DefaultLayout: React.FC<Props> = ({ children }) => {
  const { user } = useAuth()

  if (!user) {
    return <>User not found</>
  }

  return (
    <Container>
      <LeftColumn>
        <SideBar user={user} />
      </LeftColumn>
      <RightColumn>
        <Content>{children}</Content>
      </RightColumn>
    </Container>
  )
}

export default DefaultLayout
