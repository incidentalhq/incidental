import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import EmptyTable from '@/components/Empty/EmptyTable'
import DeclareIncidentForm, { FormValues as DeclareIncidentFormValues } from '@/components/Incident/DeclareIncidentForm'
import IncidentRow from '@/components/Incident/IncidentRow'
import Loading from '@/components/Loading/Loading'
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
  const { setModal, closeModal } = useModal()
  const { forms, organisation } = useGlobal()
  const queryClient = useQueryClient()

  const activeIncidentsQuery = useQuery({
    queryKey: ['incident-list', { status: 'active', organisation: organisation?.id }],
    queryFn: () => apiService.searchIncidents({ statusCategory: [IncidentStatusCategory.ACTIVE] })
  })

  const inTriageQuery = useQuery({
    queryKey: ['incident-list', { status: 'triage', organisation: organisation?.id }],
    queryFn: () => apiService.searchIncidents({ statusCategory: [IncidentStatusCategory.TRIAGE] })
  })

  const handleCreateIncident = useCallback(
    async (values: DeclareIncidentFormValues) => {
      try {
        await apiService.createIncident(values)
        queryClient.invalidateQueries({
          queryKey: ['incident-list']
        })
        toast('Incident declared', { type: 'success' })
        closeModal()
      } catch (e) {
        console.error('There was an issue creating the incident')
      }
    },
    [apiService, closeModal, queryClient]
  )

  const handleOpenDeclareModal = useCallback(
    (evt: React.MouseEvent<HTMLButtonElement>) => {
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
    },
    [setModal, forms, handleCreateIncident]
  )

  return (
    <Root>
      <Box>
        <Header>
          <Title>Dashboard</Title>
          <div>
            <Button $primary={true} onClick={handleOpenDeclareModal}>
              Declare incident
            </Button>
          </div>
        </Header>
        <CategoryHeader>
          Active incidents <Count>{activeIncidentsQuery.data?.total}</Count>
        </CategoryHeader>
        <Content>
          <ContentMain $padding={false}>
            {activeIncidentsQuery.isFetching && <Loading text="Loading active incidents" />}
            {activeIncidentsQuery.isSuccess ? (
              <>
                {activeIncidentsQuery.data.items.map((it) => (
                  <IncidentRow key={it.id} incident={it} />
                ))}
                {activeIncidentsQuery.data.total == 0 && <EmptyTable>No active incidents</EmptyTable>}
              </>
            ) : null}
          </ContentMain>
        </Content>

        <CategoryHeader>
          In Triage <Count>{inTriageQuery.data?.total}</Count>
        </CategoryHeader>
        <Content>
          <ContentMain $padding={false}>
            {inTriageQuery.isFetching && <Loading text="Loading incidents in triage" />}
            {inTriageQuery.isSuccess ? (
              <>
                {inTriageQuery.data.items.map((it) => (
                  <IncidentRow key={it.id} incident={it} />
                ))}

                {inTriageQuery.data.total == 0 && <EmptyTable>No incidents in triage</EmptyTable>}
              </>
            ) : null}
          </ContentMain>
        </Content>
      </Box>
    </Root>
  )
}

export default Dashboard
