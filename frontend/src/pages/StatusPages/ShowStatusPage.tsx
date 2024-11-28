import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import arrowUpRight from '@/assets/icons/arrow-up-right.svg'
import Button from '@/components/Button/Button'
import Icon from '@/components/Icon/Icon'
import Loading from '@/components/Loading/Loading'
import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import { ModelID } from '@/types/models'

import ManageComponentsSection from './components/ManageComponentsSection'
import StatusPageIncidentRow from './components/StatusPageIncidentRow'

import CreateIncidentModal from './modals/CreateIncidentModal'

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
  const { id } = useParams() as UrlParams
  const [showCreateIncidentModal, setShowCreateIncidentModal] = useState(false)

  const {
    data: statusPage,
    isLoading,
    error
  } = useQuery({
    queryKey: ['get-status-page', id],
    queryFn: () => apiService.getStatusPage(id)
  })

  const incidentsQuery = useQuery({
    queryKey: ['get-active-status-page-incidents', id],
    queryFn: () =>
      apiService.getStatusPageIncidents({
        id,
        isActive: true
      })
  })

  return (
    <>
      <Box>
        <Header>
          <Title>Status page</Title>
          <Button $primary onClick={() => setShowCreateIncidentModal(true)}>
            Create status page incident
          </Button>
        </Header>
        <Content>
          {showCreateIncidentModal && statusPage && (
            <CreateIncidentModal statusPage={statusPage} onClose={() => setShowCreateIncidentModal(false)} />
          )}
          {isLoading && <Loading text="Loading status page" />}
          {error && <p>Error loading status page</p>}
          {statusPage ? (
            <>
              <ContentMain $padding={false}>
                <ContentHeader>
                  <h3>{statusPage?.name}</h3>
                </ContentHeader>
                <ContentSection>
                  <div>
                    <a href={statusPage.publicUrl} target="_blank">
                      {statusPage.publicUrl} <Icon icon={arrowUpRight} />
                    </a>
                  </div>
                </ContentSection>
                <ContentSection>
                  <h3>Active Incidents</h3>
                  {incidentsQuery.isLoading && <Loading text="Loading incidents" />}
                  {incidentsQuery.error && <p>Error loading incidents</p>}
                  {incidentsQuery.data && incidentsQuery.data.items.length === 0 && <p>No active incidents</p>}

                  {incidentsQuery.data && (
                    <div>
                      {incidentsQuery.data.items.map((incident) => (
                        <StatusPageIncidentRow isBlock incident={incident} key={incident.id} />
                      ))}
                    </div>
                  )}
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
