import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import Button from '@/components/Button/Button'
import Empty from '@/components/Empty/Empty'
import Loading from '@/components/Loading/Loading'
import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { RoutePaths } from '@/routes'
import { IStatusPage } from '@/types/models'

import StatusPageItem from './components/StatusPageItem'

import CreateStatusPageModal from './CreateStatusPageModal'

const SectionHeader = styled.h3`
  margin-bottom: 1rem;
`
const BlocksContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  place-items: stretch;
  gap: 16px;
  margin-top: 2rem;
`

const StatusPagesList = () => {
  const { apiService } = useApiService()
  const { organisation } = useGlobal()
  const navigate = useNavigate()
  const [showCreateModel, setShowCreateModal] = useState(false)

  const {
    data: statusPages,
    isLoading,
    isFetched,
    error
  } = useQuery({
    queryKey: ['list-status-pages', organisation?.id],
    queryFn: () => apiService.searchStatusPages()
  })

  const onClick = (statusPage: IStatusPage) => {
    navigate(generatePath(RoutePaths.STATUS_PAGE_SHOW, { id: statusPage.id }))
  }

  const handleAddStatusPage = useCallback(() => {
    setShowCreateModal(true)
  }, [])

  return (
    <>
      {showCreateModel && <CreateStatusPageModal onClose={() => setShowCreateModal(false)} />}
      <Box>
        <Header>
          <Title>Status pages</Title>
          <Button onClick={handleAddStatusPage}>Add status page</Button>
        </Header>
        <Content>
          <ContentMain>
            {isLoading && <Loading text="Loading status pages" />}
            {error && <p>Error loading status pages</p>}
            <SectionHeader>Public status pages</SectionHeader>
            {isFetched && statusPages?.items.length === 0 && <Empty message="No status pages found" />}
            <BlocksContainer>
              {statusPages && statusPages.items.map((it) => <StatusPageItem statusPage={it} onClick={onClick} />)}
            </BlocksContainer>
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default StatusPagesList
