import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import EmptyTable from '@/components/Empty/EmptyTable'
import Loading from '@/components/Loading/Loading'
import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import { ModelID } from '@/types/models'

import StatusPageIncidentRow from './components/StatusPageIncidentRow'

const CategoryHeader = styled.div`
  padding: 1rem 20px;
  background-color: var(--color-gray-100);
  font-weight: 500;
`

type UrlParams = {
  id: ModelID
}

const StatusPageListIncidents = () => {
  const { apiService } = useApiService()
  const { id } = useParams() as UrlParams

  const incidentsQuery = useQuery({
    queryKey: ['get-active-status-page-incidents', id],
    queryFn: () =>
      apiService.getStatusPageIncidents({
        id
      })
  })

  return (
    <Box>
      <Header>
        <Title>Incidents</Title>
      </Header>
      <CategoryHeader>All status page incidents</CategoryHeader>
      <Content>
        {incidentsQuery.isError && (
          <ContentMain>
            <p>There was an error loading incidents...</p>
          </ContentMain>
        )}
        {incidentsQuery.isFetching && (
          <ContentMain>
            <Loading text="Loading active incidents" />
          </ContentMain>
        )}
        {incidentsQuery.isSuccess && (
          <ContentMain $padding={false}>
            {incidentsQuery.data.items.map((it) => (
              <StatusPageIncidentRow incident={it} key={it.id} />
            ))}
            {incidentsQuery.data.total == 0 && <EmptyTable>No active incidents</EmptyTable>}
          </ContentMain>
        )}
      </Content>
    </Box>
  )
}

export default StatusPageListIncidents
