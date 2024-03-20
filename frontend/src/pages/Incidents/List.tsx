import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import EmptyTable from '@/components/Empty/EmptyTable'
import DeclareIncidentForm, { FormValues as DeclareIncidentFormValues } from '@/components/Incident/DeclareIncidentForm'
import IncidentRow from '@/components/Incident/IncidentRow'
import { useModal } from '@/components/Modal/useModal'
import { Box, Button, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { FormType } from '@/types/enums'

const CategoryHeader = styled.div`
  padding: 1rem 20px;
  background-color: var(--color-gray-100);
  font-weight: 500;
`
const ModalContainer = styled.div`
  padding: 1rem;
  width: 600px;
`

const IncidentsList = () => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()
  const { closeModal, setModal } = useModal()
  const { forms } = useGlobal()

  const activeIncidentsQuery = useQuery({
    queryKey: ['incident-list', { status: 'all' }],
    queryFn: () => apiService.searchIncidents({})
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
    <Box>
      <Header>
        <Title>Incidents</Title>
        <div>
          <Button $primary={true} onClick={handleOpenDeclareModal}>
            Declare incident
          </Button>
        </div>
      </Header>
      <CategoryHeader>All incidents</CategoryHeader>
      <Content>
        <ContentMain $padding={false}>
          {activeIncidentsQuery.isSuccess ? (
            <>
              {activeIncidentsQuery.data.items.map((it) => (
                <IncidentRow key={it.id} incident={it} />
              ))}
              {activeIncidentsQuery.data.total == 0 && <EmptyTable>No incidents found</EmptyTable>}
            </>
          ) : null}
        </ContentMain>
      </Content>
    </Box>
  )
}

export default IncidentsList
