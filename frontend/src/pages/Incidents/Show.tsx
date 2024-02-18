import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import Loading from '@/components/Loading/Loading'
import { Box, Content, ContentMain, ContentSidebar, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'

import Timeline from './components/IncidentUpdate/Timeline'

const Description = styled.div`
  margin-bottom: 1rem;
`

const Field = styled.div`
  display: flex;
  padding: 1rem;
`
const FieldName = styled.div`
  width: 90px;
`
const FieldValue = styled.div``

type UrlParams = {
  id: string
}

const ShowIncident = () => {
  const { apiService } = useApiService()
  const { id } = useParams<UrlParams>() as UrlParams

  const query = useQuery({
    queryKey: ['incident', id],
    queryFn: () => apiService.getIncident(id)
  })

  const incidentUpdatesQuery = useQuery({
    queryKey: ['incident-updates', id],
    queryFn: () => apiService.getIncidentUpdates(id)
  })

  return (
    <>
      <Box>
        {query.isLoading && <Loading />}
        {query.isSuccess ? (
          <>
            <Header>
              <Title>{query.data.name}</Title>
            </Header>
            <Content>
              <ContentMain>
                <Description>
                  {query.data.description ? <p>{query.data.description}</p> : <p>Add description...</p>}
                </Description>

                <h3>Updates</h3>
                {incidentUpdatesQuery.isSuccess ? (
                  <Timeline updates={incidentUpdatesQuery.data.items} />
                ) : (
                  <p>There was an issue </p>
                )}
              </ContentMain>
              <ContentSidebar>
                <Field>
                  <FieldName>Status</FieldName>
                  <FieldValue>{query.data.incidentStatus.name}</FieldValue>
                </Field>
                <Field>
                  <FieldName>Severity</FieldName>
                  <FieldValue>{query.data.incidentSeverity.name}</FieldValue>
                </Field>
                <Field>
                  <FieldName>Type</FieldName>
                  <FieldValue>{query.data.incidentType.name}</FieldValue>
                </Field>
                {query.data.incidentRoleAssignments.map((it) => (
                  <Field>
                    <FieldName>{it.incidentRole.name}</FieldName>
                    <FieldValue>{it.user.name}</FieldValue>
                  </Field>
                ))}
              </ContentSidebar>
            </Content>
          </>
        ) : null}
      </Box>
    </>
  )
}

export default ShowIncident
