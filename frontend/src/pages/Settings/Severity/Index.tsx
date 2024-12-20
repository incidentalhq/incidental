import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import trash from '@/assets/icons/trash.svg'
import ConfirmDelete from '@/components/Button/ConfirmDelete'
import Icon from '@/components/Icon/Icon'
import Table, { ColumnProperty } from '@/components/Table/Table'
import { Box, Content, ContentMain, Header, StyledButton, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { APIError } from '@/services/transport'
import { IIncidentSeverity } from '@/types/models'

import CreateSeverityModal from './CreateSeverityModal'
import EditSeverityModal from './EditSeverityModal'

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

const SettingsSeverity = () => {
  const { organisation } = useGlobal()
  const { apiService } = useApiService()
  const [showEditSeverityModal, setShowEditSeverityModal] = useState<IIncidentSeverity>()
  const [showCreateSeverityModal, setShowCreateSeverityModal] = useState(false)

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
                <StyledButton onClick={() => setShowEditSeverityModal(v)}>Edit</StyledButton>
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
    [handleDelete]
  )

  return (
    <>
      {showEditSeverityModal && (
        <EditSeverityModal onClose={() => setShowEditSeverityModal(undefined)} severity={showEditSeverityModal} />
      )}
      {showCreateSeverityModal && <CreateSeverityModal onClose={() => setShowCreateSeverityModal(false)} />}
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
              <StyledButton $primary={true} onClick={() => setShowCreateSeverityModal(true)}>
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
