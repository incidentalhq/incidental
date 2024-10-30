import styled from 'styled-components'

import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'

const Intro = styled.div`
  padding: 1rem;
`

const StatusPagesIndex = () => {
  return (
    <>
      <Box>
        <Header>
          <Title>Status pages</Title>
        </Header>
        <Content>
          <ContentMain $padding={false}></ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default StatusPagesIndex
