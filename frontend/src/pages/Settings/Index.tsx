import styled from 'styled-components'

import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'

const Intro = styled.div`
  padding: 1rem;
`

const SettingsIndex = () => {
  return (
    <>
      <Box>
        <Header>
          <Title>Overview</Title>
        </Header>
        <Content>
          <ContentMain $padding={false}>
            <Intro>
              <p>Customise your workspace</p>
            </Intro>
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default SettingsIndex
