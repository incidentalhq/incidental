import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import Button from '@/components/Button/Button'
import Loading from '@/components/Loading/Loading'
import { Box, Content, ContentMain, Header, StyledButton, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { ModelID } from '@/types/models'

import ManageComponentsSection from './components/ManageComponentsSection'

type UrlParams = {
  id: ModelID
}

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 20px 0 20px;
`
const ContentSection = styled.div`
  padding-bottom: 3rem;
  border-bottom: 1px solid var(--color-slate-200);
  margin-bottom: 1rem;
  padding: 1rem 20px;
`

const ShowStatusPage = () => {
  const { apiService } = useApiService()
  const { organisation } = useGlobal()
  const { id } = useParams() as UrlParams

  const {
    data: statusPage,
    isLoading,
    error
  } = useQuery({
    queryKey: ['get-status-page', id],
    queryFn: () => apiService.getStatusPage(id)
  })

  return (
    <>
      <Box>
        <Header>
          <Title>Status page</Title>
          <Button>Create status page incident</Button>
        </Header>
        <Content>
          {isLoading && <Loading text="Loading status page" />}
          {error && <p>Error loading status page</p>}
          {statusPage ? (
            <>
              <ContentMain $padding={false}>
                <ContentHeader>
                  <h3>{statusPage?.name}</h3>
                </ContentHeader>
                <ContentSection>
                  <div>{statusPage.publicUrl}</div>
                </ContentSection>
                <ContentHeader>
                  <h3>Components</h3>
                </ContentHeader>
                <ContentSection>
                  <ManageComponentsSection statusPage={statusPage} />
                </ContentSection>
              </ContentMain>
            </>
          ) : null}
        </Content>
      </Box>
    </>
  )
}

export default ShowStatusPage
