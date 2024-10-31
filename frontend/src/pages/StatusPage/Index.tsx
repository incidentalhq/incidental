import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'

import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'

import StatusPageItem from './components/StatusPageItem/StatusPageItem'

const SectionHeader = styled.h3`
  margin-bottom: 1rem;
`
const StatusPagesList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  place-items: stretch;
  gap: 16px;
  margin-top: 2rem;
`

const StatusPagesIndex = () => {
  const { apiService } = useApiService()
  const { organisation } = useGlobal()

  const {
    data: statusPages,
    isLoading,
    error
  } = useQuery({
    queryKey: ['list-status-pages', organisation?.id],
    queryFn: () => apiService.searchStatusPages()
  })

  return (
    <>
      <Box>
        <Header>
          <Title>Status pages</Title>
        </Header>
        <Content>
          <ContentMain>
            {isLoading && <p>Loading...</p>}
            {error && <p>Error loading status pages</p>}
            <SectionHeader>Public status pages</SectionHeader>
            <StatusPagesList>
              {statusPages && statusPages.items.map((it) => <StatusPageItem statusPage={it} />)}
            </StatusPagesList>
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default StatusPagesIndex
