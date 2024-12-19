import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import styled from 'styled-components'

import EmptyTable from '@/components/Empty/EmptyTable'
import IncidentRow from '@/components/Incident/IncidentRow'
import Loading from '@/components/Loading/Loading'
import { Box, Content, ContentMain, Header, StyledButton, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import DeclareIncidentModal from '@/modals/Incident/DeclareIncidentModal'

const CategoryHeader = styled.div`
  padding: 1rem 20px;
  background-color: var(--color-gray-100);
  font-weight: 500;
`

const IncidentsList = () => {
  const { apiService } = useApiService()
  const { organisation } = useGlobal()
  const [showDeclareIncidentModal, setShowDeclareIncidentModal] = useState(false)

  const activeIncidentsQuery = useQuery({
    queryKey: ['incident-list', { status: 'all', organisation: organisation?.id }],
    queryFn: () => apiService.searchIncidents({})
  })

  return (
    <Box>
      {showDeclareIncidentModal && <DeclareIncidentModal onClose={() => setShowDeclareIncidentModal(false)} />}
      <Header>
        <Title>Incidents</Title>
        <div>
          <StyledButton $primary={true} onClick={() => setShowDeclareIncidentModal(true)}>
            Declare incident
          </StyledButton>
        </div>
      </Header>
      <CategoryHeader>All incidents</CategoryHeader>
      <Content>
        {activeIncidentsQuery.isError && (
          <ContentMain>
            <p>There was an error loading incidents...</p>
          </ContentMain>
        )}
        {activeIncidentsQuery.isFetching && (
          <ContentMain>
            <Loading text="Loading active incidents" />
          </ContentMain>
        )}
        {activeIncidentsQuery.isSuccess && (
          <ContentMain $padding={false}>
            {activeIncidentsQuery.data.items.map((it) => (
              <IncidentRow key={it.id} incident={it} />
            ))}
            {activeIncidentsQuery.data.total == 0 && <EmptyTable>No active incidents</EmptyTable>}
          </ContentMain>
        )}
      </Content>
    </Box>
  )
}

export default IncidentsList
