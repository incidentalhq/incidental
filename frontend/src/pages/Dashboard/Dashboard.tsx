import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import styled from 'styled-components'

import DeclareIncidentForm, { FormValues as DeclareIncidentFormValues } from '@/components/Incident/DeclareIncidentForm'
import IncidentRow from '@/components/Incident/IncidentRow'
import { useModal } from '@/components/Modal/useModal'
import { Box, Button, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { FormType, IncidentStatusCategory } from '@/types/enums'

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
const ModalContainer = styled.div`
  padding: 1rem;
  width: 600px;
`

const Dashboard = () => {
  const { apiService } = useApiService()
  const { setModal } = useModal()
  const { forms } = useGlobal()

  const activeIncidentsQuery = useQuery({
    queryKey: ['active-incidents'],
    queryFn: () => apiService.searchIncidents({ statusCategory: [IncidentStatusCategory.ACTIVE] })
  })

  const inTriageQuery = useQuery({
    queryKey: ['triage-incidents'],
    queryFn: () => apiService.searchIncidents({ statusCategory: [IncidentStatusCategory.TRIAGE] })
  })

  const handleCreateIncident = useCallback((values: DeclareIncidentFormValues) => {
    console.log(values)
  }, [])

  const handleDeclare = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault()
    const createForm = forms.find((it) => it.type == FormType.CREATE_INCIDENT)
    if (!createForm) {
      console.error('Could not find create form')
      return
    }
    setModal(
      <ModalContainer>
        <h2>Declare incident</h2>
        <DeclareIncidentForm onSubmit={handleCreateIncident} form={createForm} />
      </ModalContainer>
    )
  }

  return (
    <Root>
      <Box>
        <Header>
          <Title>Dashboard</Title>
          <div>
            <Button $primary={true} onClick={handleDeclare}>
              Declare incident
            </Button>
          </div>
        </Header>
        <CategoryHeader>
          Active incidents <Count>{activeIncidentsQuery.data?.total}</Count>
        </CategoryHeader>
        <Content>
          <ContentMain $padding={false}>
            {activeIncidentsQuery.isSuccess ? (
              <>
                {activeIncidentsQuery.data.items.map((it) => (
                  <IncidentRow incident={it} />
                ))}
              </>
            ) : null}
          </ContentMain>
        </Content>

        <CategoryHeader>
          In Triage <Count>{inTriageQuery.data?.total}</Count>
        </CategoryHeader>
        <Content>
          <ContentMain $padding={false}>
            {inTriageQuery.isSuccess ? (
              <>
                {inTriageQuery.data.items.map((it) => (
                  <IncidentRow incident={it} />
                ))}
              </>
            ) : null}
          </ContentMain>
        </Content>
      </Box>
    </Root>
  )
}

export default Dashboard
