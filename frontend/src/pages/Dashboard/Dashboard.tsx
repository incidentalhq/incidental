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
import { IncidentStatusCategory } from '@/types/enums'

const Root = styled.div``
const CategoryHeader = styled.div`
  padding: 1rem 20px;
  background-color: var(--color-gray-100);
  font-weight: 500;
`
const Count = styled.span`
  color: var(--color-slate-600);
  padding-left: 1rem;
`

const Dashboard = () => {
  const { apiService } = useApiService()
  const { organisation } = useGlobal()
  const [showDeclareIncidentModal, setShowDeclareIncidentModal] = useState(false)

  const activeIncidentsQuery = useQuery({
    queryKey: ['incident-list', { status: 'active', organisation: organisation?.id }],
    queryFn: () => apiService.searchIncidents({ statusCategory: [IncidentStatusCategory.ACTIVE] })
  })

  const inTriageQuery = useQuery({
    queryKey: ['incident-list', { status: 'triage', organisation: organisation?.id }],
    queryFn: () => apiService.searchIncidents({ statusCategory: [IncidentStatusCategory.TRIAGE] })
  })

  return (
    <Root>
      {showDeclareIncidentModal && <DeclareIncidentModal onClose={() => setShowDeclareIncidentModal(false)} />}
      <Box>
        <Header>
          <Title>Dashboard</Title>
          <div>
            <StyledButton $primary={true} onClick={() => setShowDeclareIncidentModal(true)}>
              Declare incident
            </StyledButton>
          </div>
        </Header>
        <CategoryHeader>
          Active incidents <Count>{activeIncidentsQuery.data?.total}</Count>
        </CategoryHeader>
        <Content>
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

        <CategoryHeader>
          In Triage <Count>{inTriageQuery.data?.total}</Count>
        </CategoryHeader>
        <Content>
          {inTriageQuery.isFetching && (
            <ContentMain>
              <Loading text="Loading incidents in triage" />
            </ContentMain>
          )}
          {inTriageQuery.isSuccess && (
            <ContentMain $padding={false}>
              {inTriageQuery.data.items.map((it) => (
                <IncidentRow key={it.id} incident={it} />
              ))}
              {inTriageQuery.data.total == 0 && <EmptyTable>No incidents in triage</EmptyTable>}
            </ContentMain>
          )}
        </Content>
      </Box>
    </Root>
  )
}

export default Dashboard
