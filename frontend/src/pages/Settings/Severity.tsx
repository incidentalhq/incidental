import { useMemo } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import trash from '@/assets/icons/trash.svg'
import ConfirmDelete from '@/components/Button/ConfirmDelete'
import Icon from '@/components/Icon/Icon'
import { useModal } from '@/components/Modal/useModal'
import Table, { ColumnProperty } from '@/components/Table/Table'
import { Box, Button, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { APIError } from '@/services/transport'
import { IIncidentSeverity } from '@/types/models'

import SeverityForm, { FormValues as SeverityFormValues } from './forms/SeverityForm'

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
const SeverityModal = styled.div`
  padding: 1rem;
  min-width: 600px;
`

const SettingsSeverity = () => {
  const { severityList, setSeverityList } = useGlobal()
  const { setModal, closeModal } = useModal()
  const { apiService } = useApiService()

  const columns = useMemo(
    () =>
      [
        {
          name: 'Rank',
          render: (v) => v.rating
        },
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
                <Button onClick={() => handleOpenEditModal(v)}>Edit</Button>
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
    []
  )

  const handleDelete = async (severity: IIncidentSeverity) => {
    try {
      await apiService.deleteSeverity(severity)
      setSeverityList(severityList.filter((it) => it.id != severity.id))
    } catch (error) {
      if (error instanceof APIError) {
        toast(error.message, { type: 'error' })
      }
    }
  }

  const handleAddSeverity = async (values: SeverityFormValues) => {
    const response = await apiService.createSeverity(values)
    setSeverityList([...severityList, response])
    closeModal()
    toast('New severity added', { type: 'success' })
  }

  const handlePatchSeverity = async (severity: IIncidentSeverity, values: SeverityFormValues) => {
    const response = await apiService.patchSeverity(severity, values)
    closeModal()
    toast('Severity updated', { type: 'success' })

    setSeverityList(
      severityList.map((it) => {
        if (it.id == response.id) {
          return response
        }
        return it
      })
    )
  }

  const handleOpenCreateModal = () => {
    setModal(
      <SeverityModal>
        <h2>Create new severity</h2>
        <SeverityForm onSubmit={handleAddSeverity} />
      </SeverityModal>
    )
  }

  const handleOpenEditModal = (severity: IIncidentSeverity) => {
    setModal(
      <SeverityModal>
        <h2>Edit severity</h2>
        <SeverityForm severity={severity} onSubmit={(values) => handlePatchSeverity(severity, values)} />
      </SeverityModal>
    )
  }

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
            <Table data={severityList} rowKey={'id'} columns={columns} />
            <Actions>
              <Button $primary={true} onClick={handleOpenCreateModal}>
                Add severity
              </Button>
            </Actions>
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default SettingsSeverity
