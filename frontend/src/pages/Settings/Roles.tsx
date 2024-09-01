import { useQuery } from '@tanstack/react-query'
import { FormikHelpers } from 'formik'
import { useCallback, useMemo } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import trash from '@/assets/icons/trash.svg'
import Button from '@/components/Button/Button'
import ConfirmDelete from '@/components/Button/ConfirmDelete'
import Icon from '@/components/Icon/Icon'
import Loading from '@/components/Loading/Loading'
import { useModal } from '@/components/Modal/useModal'
import Table, { ColumnProperty } from '@/components/Table/Table'
import { Box, Content, ContentMain, Header, StyledButton, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { APIError } from '@/services/transport'
import { IIncidentRole } from '@/types/models'
import { apiErrorsToFormikErrors } from '@/utils/form'

import RoleForm, { FormValues as RoleFormValues } from './components/Role/RoleForm'

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
const ModalContainer = styled.div`
  padding: 1rem;
  min-width: 600px;
`

const SettingsRoles = () => {
  const { organisation } = useGlobal()
  const { setModal, closeModal } = useModal()
  const { apiService } = useApiService()

  // Fetch roles for current organisation
  const rolesQuery = useQuery({
    queryKey: ['roles', organisation!.id],
    queryFn: () => apiService.getRoles()
  })

  const handleDelete = useCallback(
    async (role: IIncidentRole) => {
      try {
        await apiService.deleteRole(role)
        rolesQuery.refetch()
      } catch (error) {
        if (error instanceof APIError) {
          toast(error.message, { type: 'error' })
        }
      }
    },
    [apiService, rolesQuery]
  )

  const handleAddRole = useCallback(
    async (values: RoleFormValues, helpers: FormikHelpers<RoleFormValues>) => {
      try {
        await apiService.createRole(values)
        rolesQuery.refetch()
        closeModal()
        toast('New severity added', { type: 'success' })
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.detail, { type: 'error' })
          helpers.setErrors(apiErrorsToFormikErrors(e))
        }
      }
    },
    [apiService, closeModal, rolesQuery]
  )

  const handleUpdateRole = useCallback(
    async (role: IIncidentRole, values: RoleFormValues, helpers: FormikHelpers<RoleFormValues>) => {
      try {
        await apiService.updateRole(role, values)
        rolesQuery.refetch()
        closeModal()
        toast('Severity updated', { type: 'success' })
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.detail, { type: 'error' })
          helpers.setErrors(apiErrorsToFormikErrors(e))
        }
        console.error(e)
      }
    },
    [apiService, closeModal, rolesQuery]
  )

  const handleOpenCreateModal = () => {
    setModal(
      <ModalContainer>
        <h2>Create new role</h2>
        <RoleForm onSubmit={handleAddRole} />
      </ModalContainer>
    )
  }

  const handleOpenEditModal = useCallback(
    (role: IIncidentRole) => {
      setModal(
        <ModalContainer>
          <h2>Edit role</h2>
          <RoleForm role={role} onSubmit={(values, helpers) => handleUpdateRole(role, values, helpers)} />
        </ModalContainer>
      )
    },
    [handleUpdateRole, setModal]
  )

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
                  onClick={() => handleOpenEditModal(v)}
                  whyDisabledText="This role cannot be edited"
                >
                  Edit
                </Button>
                <ConfirmDelete
                  disabled={v.isDeletable ? false : true}
                  onConfirm={() => handleDelete(v)}
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
    [handleDelete, handleOpenEditModal]
  )

  return (
    <>
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
              <StyledButton $primary={true} onClick={handleOpenCreateModal}>
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
