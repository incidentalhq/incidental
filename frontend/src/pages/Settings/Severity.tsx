import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import trash from '@/assets/icons/trash.svg'
import ConfirmDelete from '@/components/Button/ConfirmDelete'
import Icon from '@/components/Icon/Icon'
import { useModal } from '@/components/Modal/useModal'
import Table, { ColumnProperty } from '@/components/Table/Table'
import { Box, Content, ContentMain, Header, StyledButton, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { APIError } from '@/services/transport'
import { IIncidentSeverity } from '@/types/models'

import SeverityForm, { FormValues as SeverityFormValues } from './components/SeverityForm'

const Intro = styled.div`
  padding: 1rem;
`
const Controls = styled.div`
  display: flex;
  width: 100%;

  > div {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
  }
`
const Actions = styled.div`
  padding: 1rem;
`
const ModalContainer = styled.div`
  padding: 1rem;
  min-width: 600px;
`

const SettingsSeverity = () => {
  const { organisation } = useGlobal()
  const { setModal, closeModal } = useModal()
  const { apiService } = useApiService()

  const severitiesQuery = useQuery({
    queryKey: ['severities', organisation!.id],
    queryFn: () => apiService.getIncidentSeverities()
  })

  const handleDelete = useCallback(
    async (severity: IIncidentSeverity) => {
      try {
        await apiService.deleteSeverity(severity)
        severitiesQuery.refetch()
      } catch (error) {
        if (error instanceof APIError) {
          toast(error.message, { type: 'error' })
        }
      }
    },
    [severitiesQuery, apiService]
  )

  const handleAddSeverity = useCallback(
    async (values: SeverityFormValues) => {
      try {
        await apiService.createSeverity(values)
        severitiesQuery.refetch()
        closeModal()
        toast('New severity added', { type: 'success' })
      } catch (e) {
        console.error(e)
      }
    },
    [apiService, severitiesQuery, closeModal]
  )

  const handlePatchSeverity = useCallback(
    async (severity: IIncidentSeverity, values: SeverityFormValues) => {
      try {
        await apiService.patchSeverity(severity, values)
        severitiesQuery.refetch()
        closeModal()
        toast('Severity updated', { type: 'success' })
      } catch (e) {
        console.error(e)
      }
    },
    [apiService, severitiesQuery, closeModal]
  )

  const handleOpenCreateModal = useCallback(() => {
    setModal(
      <ModalContainer>
        <h2>Create new severity</h2>
        <SeverityForm onSubmit={handleAddSeverity} />
      </ModalContainer>
    )
  }, [handleAddSeverity, setModal])

  const handleOpenEditModal = useCallback(
    (severity: IIncidentSeverity) => {
      setModal(
        <ModalContainer>
          <h2>Edit severity</h2>
          <SeverityForm severity={severity} onSubmit={(values) => handlePatchSeverity(severity, values)} />
        </ModalContainer>
      )
    },
    [handlePatchSeverity, setModal]
  )

  const columns = useMemo(
    () =>
      [
        {
          name: 'Name',
          render: (v) => v.name
        },
        {
          name: 'Description',
          render: (v) => v.description
        },
        {
          name: '',
          render: (v) => (
            <Controls>
              <div>
                <StyledButton onClick={() => handleOpenEditModal(v)}>Edit</StyledButton>
                <ConfirmDelete
                  onConfirm={() => handleDelete(v)}
                  message="Are you sure you want to delete this severity?"
                >
                  <Icon icon={trash} fixedWidth />
                </ConfirmDelete>
              </div>
            </Controls>
          )
        }
      ] as ColumnProperty<IIncidentSeverity>[],
    [handleDelete, handleOpenEditModal]
  )

  return (
    <>
      <Box>
        <Header>
          <Title>Manage Severities</Title>
        </Header>
        <Content>
          <ContentMain $padding={false}>
            <Intro>
              <p>Shown below are the different severities that can be assigned to incidents.</p>
            </Intro>
            <Table data={severitiesQuery.data?.items ?? []} rowKey={'id'} columns={columns} />
            <Actions>
              <StyledButton $primary={true} onClick={handleOpenCreateModal}>
                Add severity
              </StyledButton>
            </Actions>
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default SettingsSeverity
