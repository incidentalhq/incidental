import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import trash from '@/assets/icons/trash.svg'
import Button from '@/components/Button/Button'
import ConfirmDelete from '@/components/Button/ConfirmDelete'
import Icon from '@/components/Icon/Icon'
import Loading from '@/components/Loading/Loading'
import Table, { ColumnProperty } from '@/components/Table/Table'
import { Box, Content, ContentMain, Header, StyledButton, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { IIncidentRole } from '@/types/models'

import CreateRoleModal from './CreateRoleModal'
import EditRoleModal from './EditRoleModal'

const Intro = styled.div`
  padding: 1rem;
`
const Controls = styled.div`
  display: flex;
  width: 100%;
  padding-left: 1rem;

  > div {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
  }
`
const Actions = styled.div`
  padding: 1rem;
`

const SettingsRoles = () => {
  const { organisation } = useGlobal()
  const { apiService } = useApiService()
  const [showEditRoleModal, setShowEditRoleModal] = useState<IIncidentRole>()
  const [showCreateRoleModal, setShowCreateRoleModal] = useState<boolean>(false)

  // Fetch roles for current organisation
  const rolesQuery = useQuery({
    queryKey: ['roles', organisation!.id],
    queryFn: () => apiService.getRoles()
  })

  const deleteRoleMutation = useMutation({
    mutationFn: (role: IIncidentRole) => apiService.deleteRole(role),
    onSuccess: () => {
      rolesQuery.refetch()
      toast('Role has been deleted', { type: 'warning' })
    }
  })

  const columns = useMemo(
    () =>
      [
        {
          name: 'Name',
          render: (v) => v.name
        },
        {
          name: 'Slack reference',
          render: (v) => v.slackReference
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
                <Button
                  disabled={v.isEditable ? false : true}
                  onClick={() => setShowEditRoleModal(v)}
                  whyDisabledText="This role cannot be edited"
                >
                  Edit
                </Button>
                <ConfirmDelete
                  disabled={v.isDeletable ? false : true}
                  onConfirm={() => deleteRoleMutation.mutateAsync(v)}
                  message="Are you sure you want to delete this role?"
                  whyDisabledText="This role cannot be deleted"
                >
                  <Icon icon={trash} />
                </ConfirmDelete>
              </div>
            </Controls>
          )
        }
      ] as ColumnProperty<IIncidentRole>[],
    [deleteRoleMutation]
  )

  return (
    <>
      {showEditRoleModal && <EditRoleModal role={showEditRoleModal} onClose={() => setShowEditRoleModal(undefined)} />}
      {showCreateRoleModal && <CreateRoleModal onClose={() => setShowCreateRoleModal(false)} />}
      <Box>
        <Header>
          <Title>Manage Roles</Title>
        </Header>
        <Content>
          <ContentMain $padding={false}>
            <Intro>
              <p>Shown below are the different roles that are available to your organisation.</p>
            </Intro>
            {rolesQuery.isSuccess && <Table data={rolesQuery.data.items} rowKey={'id'} columns={columns} />}
            {rolesQuery.isFetching && <Loading text="Loading roles" />}
            <Actions>
              <StyledButton $primary={true} onClick={() => setShowCreateRoleModal(true)}>
                Add role
              </StyledButton>
            </Actions>
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default SettingsRoles
