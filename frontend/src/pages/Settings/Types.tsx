import { useQuery } from '@tanstack/react-query'
import { FormikHelpers } from 'formik'
import { useCallback, useMemo } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import trash from '@/assets/icons/trash.svg'
import Button from '@/components/Button/Button'
import ConfirmDelete from '@/components/Button/ConfirmDelete'
import Icon from '@/components/Icon/Icon'
import { useModal } from '@/components/Modal/useModal'
import Table, { ColumnProperty } from '@/components/Table/Table'
import { Box, Content, ContentMain, Header, StyledButton, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { APIError } from '@/services/transport'
import { IIncidentType } from '@/types/models'
import { apiErrorsToFormikErrors } from '@/utils/form'

import IncidentTypeForm, { FormValues as IncidentTypeFormValues } from './components/IncidentType/IncidentTypeForm'

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

const SettingsIncidentTypes = () => {
  const { setModal, closeModal } = useModal()
  const { apiService } = useApiService()
  const { organisation } = useGlobal()

  const incidentTypesQuery = useQuery({
    queryKey: [organisation?.id, 'types'],
    queryFn: () => apiService.getIncidentTypes()
  })
  const fieldsQuery = useQuery({
    queryKey: [organisation?.id, 'fields'],
    queryFn: () => apiService.getFields()
  })

  const handleDelete = useCallback(
    async (type: IIncidentType) => {
      try {
        await apiService.deleteIncidentType(type)
        incidentTypesQuery.refetch()
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.detail, { type: 'error' })
        }
        console.error(e)
      }
    },
    [apiService, incidentTypesQuery]
  )

  // Call backend create
  const handleCreate = useCallback(
    async (values: IncidentTypeFormValues) => {
      try {
        const normalized = {
          ...values,
          fields: values.fields.map((it) => ({
            id: it.id
          }))
        }
        await apiService.createIncidentType(normalized)
        incidentTypesQuery.refetch()
        closeModal()
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.detail, { type: 'error' })
        }
        console.error(e)
      }
    },
    [apiService, incidentTypesQuery, closeModal]
  )

  // Call backend patch
  const handlePatch = useCallback(
    async (type: IIncidentType, values: IncidentTypeFormValues, helpers: FormikHelpers<IncidentTypeFormValues>) => {
      try {
        const normalized = {
          ...values,
          fields: values.fields.map((it) => ({
            id: it.id
          }))
        }
        await apiService.patchIncidentType(type, normalized)
        incidentTypesQuery.refetch()
        closeModal()
      } catch (e) {
        if (e instanceof APIError) {
          helpers.setErrors(apiErrorsToFormikErrors(e))
        }
        console.error(e)
      }
    },
    [apiService, incidentTypesQuery, closeModal]
  )

  // Open modal for create new type
  const handleOpenCreateModal = useCallback(() => {
    if (!fieldsQuery.data) {
      console.error('Fields query is not ready yet')
      return
    }
    setModal(
      <ModalContainer>
        <h2>Create new incident type</h2>
        <IncidentTypeForm
          fields={fieldsQuery.data?.items.filter((it) => it.isSystem === false)}
          onSubmit={handleCreate}
        />
      </ModalContainer>
    )
  }, [handleCreate, setModal, fieldsQuery.data])

  // Open modal for editing type
  const handleOpenEditModal = useCallback(
    (type: IIncidentType) => {
      if (!fieldsQuery.data) {
        console.error('Fields query is not ready')
        return
      }
      setModal(
        <ModalContainer>
          <h2>Edit incident type</h2>
          <IncidentTypeForm
            fields={fieldsQuery.data.items.filter((it) => it.isSystem === false)}
            incidentType={type}
            onSubmit={(values, helpers) => handlePatch(type, values, helpers)}
          />
        </ModalContainer>
      )
    },
    [handlePatch, setModal, fieldsQuery.data]
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
                <Button
                  whyDisabledText="This type cannot be edited"
                  disabled={!v.isEditable}
                  onClick={() => handleOpenEditModal(v)}
                >
                  Edit
                </Button>
                <ConfirmDelete
                  disabled={!v.isDeletable}
                  whyDisabledText={'This type cannot be deleted'}
                  onConfirm={() => handleDelete(v)}
                  message="Are you sure you want to delete this type?"
                >
                  <Icon icon={trash} fixedWidth />
                </ConfirmDelete>
              </div>
            </Controls>
          )
        }
      ] as ColumnProperty<IIncidentType>[],
    [handleDelete, handleOpenEditModal]
  )

  return (
    <>
      <Box>
        <Header>
          <Title>Manage incident types</Title>
        </Header>
        <Content>
          <ContentMain $padding={false}>
            <Intro>
              <p>Shown below are incident types that are available for your organisation</p>
            </Intro>
            {incidentTypesQuery.isSuccess ? (
              <Table data={incidentTypesQuery.data.items} rowKey={'id'} columns={columns} />
            ) : null}
            <Actions>
              <StyledButton $primary={true} onClick={handleOpenCreateModal}>
                Add incident type
              </StyledButton>
            </Actions>
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default SettingsIncidentTypes
