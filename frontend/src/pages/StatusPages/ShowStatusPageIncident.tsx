import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import Button from '@/components/Button/Button'
import Loading from '@/components/Loading/Loading'
import { Box, Content, ContentMain, Header, Pill, Title } from '@/components/Theme/Styles'
import Timeline from '@/components/Timeline/Timeline'
import useApiService from '@/hooks/useApi'
import { ComponentStatus } from '@/types/enums'
import { ModelID } from '@/types/models'

import ComponentsUptimeSection from './components/ComponentsUptimeSection'
import StatusPageIncidentUpdateRow from './components/IncidentUpdateRow'

import CreateStatusPageIncidentUpdateModal from './CreateStatusPageIncidentUpdateModal'
import { mapComponentStatusToStyleProps, statusToTitleCase } from './utils'

type UrlParams = {
  id: ModelID
  incidentId: ModelID
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
const ContentSidebar = styled.div`
  flex-grow: 1;
  max-width: 480px;
  min-width: 320px;
  background-color: var(--color-gray-50);
  padding: 1rem;
  height: 100vh;
`
const FieldsHeader = styled.div`
  margin: 2rem 0 1rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  align-items: center;
  color: var(--color-gray-600);

  display: flex;

  & > :first-child {
    width: 90px;
    margin-right: 1rem;
  }
`
const RelatedFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`
const Field = styled.div`
  display: flex;
  padding: 0 0 0 1rem;
  align-items: center;
`
const FieldName = styled.div`
  width: 90px;
  margin-right: 1rem;
`
const FieldValue = styled.div`
  display: flex;
  gap: 8px;
`

const ShowStatusPageIncident = () => {
  const { apiService } = useApiService()
  const { id, incidentId } = useParams() as UrlParams
  const [showCreateStatusPageIncidentUpdateModal, setShowCreateStatusPageIncidentUpdateModal] = useState(false)

  const {
    data: statusPage,
    isLoading,
    error
  } = useQuery({
    queryKey: ['get-status-page', id],
    queryFn: () => apiService.getStatusPage(id)
  })

  const getIncidentQuery = useQuery({
    queryKey: ['get-status-page-incident', incidentId],
    queryFn: () => apiService.getStatusPageIncident(incidentId)
  })

  const getIncidentEvents = useQuery({
    queryKey: ['get-status-page-incident-events', incidentId],
    queryFn: () => apiService.getStatusPageIncidentEvents(incidentId)
  })

  return (
    <>
      <Box>
        <Header>
          <Title>{getIncidentQuery.data?.name}</Title>
          <Button $primary onClick={() => setShowCreateStatusPageIncidentUpdateModal(true)}>
            Share update
          </Button>
        </Header>
        <Content>
          {showCreateStatusPageIncidentUpdateModal && getIncidentQuery.data && statusPage && (
            <CreateStatusPageIncidentUpdateModal
              onClose={() => setShowCreateStatusPageIncidentUpdateModal(false)}
              statusPageIncident={getIncidentQuery.data}
              statusPage={statusPage}
            />
          )}
          {isLoading && <Loading text="Loading status page" />}
          {error && <p>Error loading status page</p>}
          {statusPage ? (
            <>
              <ContentMain $padding={false}>
                <ContentHeader>
                  <h3>Updates</h3>
                </ContentHeader>
                <ContentSection>
                  <Timeline
                    updates={getIncidentQuery.data?.incidentUpdates || []}
                    render={(item) => <StatusPageIncidentUpdateRow statusPageIncidentUpdate={item} />}
                  />
                </ContentSection>
                <ContentHeader>
                  <h3>Uptime</h3>
                </ContentHeader>
                <ContentSection>
                  {getIncidentEvents.data && <ComponentsUptimeSection events={getIncidentEvents.data.items} />}
                </ContentSection>
              </ContentMain>
              <ContentSidebar>
                <FieldsHeader>Current status</FieldsHeader>
                <RelatedFields>
                  {getIncidentQuery.data?.incidentUpdates
                    .at(0)
                    ?.componentUpdates.filter((it) => it.status !== ComponentStatus.OPERATIONAL)
                    .map((component) => (
                      <Field key={component.id}>
                        <FieldName>{component.statusPageComponent.name}</FieldName>
                        <FieldValue>
                          <Pill {...mapComponentStatusToStyleProps(component.status)}>
                            {statusToTitleCase(component.status)}
                          </Pill>
                        </FieldValue>
                      </Field>
                    ))}
                </RelatedFields>
              </ContentSidebar>
            </>
          ) : null}
        </Content>
      </Box>
    </>
  )
}

export default ShowStatusPageIncident
