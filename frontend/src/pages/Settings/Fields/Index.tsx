import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import trash from '@/assets/icons/trash.svg'
import Button from '@/components/Button/Button'
import ConfirmDelete from '@/components/Button/ConfirmDelete'
import Icon from '@/components/Icon/Icon'
import Table, { ColumnProperty } from '@/components/Table/Table'
import { Box, Content, ContentMain, Header, Pill, StyledButton, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { APIError } from '@/services/transport'
import { FieldInterfaceKind, FieldKind } from '@/types/enums'
import { IField } from '@/types/models'

import CreateFieldModal from './CreateFieldModal'
import EditFieldModal from './EditFieldModal'

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

const humanizedFieldInterfaceKind = (kind: FieldInterfaceKind) => {
  switch (kind) {
    case FieldInterfaceKind.MULTI_SELECT:
      return 'Multi select'
    case FieldInterfaceKind.SINGLE_SELECT:
      return 'Single select'
    case FieldInterfaceKind.TEXT:
      return 'Text'
    case FieldInterfaceKind.TEXTAREA:
      return 'Textarea'
  }
}

const SettingsFields = () => {
  const { apiService } = useApiService()
  const { organisation } = useGlobal()
  const [showEditFieldModal, setShowEditFieldModal] = useState<IField>()
  const [showCreateFieldModel, setShowCreateFieldModel] = useState(false)

  const fieldsQuery = useQuery({
    queryKey: ['fields', organisation?.id],
    queryFn: () => apiService.getFields()
  })

  const handleDelete = useCallback(
    async (field: IField) => {
      try {
        await apiService.deleteField(field)
        fieldsQuery.refetch()
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.detail, { type: 'error' })
        }
        console.error(e)
      }
    },
    [apiService, fieldsQuery]
  )

  const columns = useMemo(
    () =>
      [
        {
          name: 'Label',
          render: (v) => v.label
        },
        {
          name: 'Description',
          render: (v) => v.description
        },
        {
          name: 'UI',
          render: (v) => humanizedFieldInterfaceKind(v.interfaceKind)
        },
        {
          name: 'Kind',
          render: (v) => (
            <>
              {v.kind === FieldKind.USER_DEFINED ? (
                <Pill>Custom</Pill>
              ) : (
                <Pill $backgroundColor="var(--color-gray-50)">System</Pill>
              )}
            </>
          )
        },
        {
          name: '',
          render: (v) => (
            <Controls>
              <div>
                <Button
                  whyDisabledText="This field cannot be edited"
                  disabled={!v.isEditable}
                  onClick={() => setShowEditFieldModal(v)}
                >
                  Edit
                </Button>
                <ConfirmDelete
                  disabled={!v.isDeletable}
                  whyDisabledText={'This field cannot be deleted'}
                  onConfirm={() => handleDelete(v)}
                  message="Are you sure you want to delete this field?"
                >
                  <Icon icon={trash} fixedWidth />
                </ConfirmDelete>
              </div>
            </Controls>
          )
        }
      ] as ColumnProperty<IField>[],
    [handleDelete, setShowEditFieldModal]
  )

  const fieldsSorted = useMemo(() => fieldsQuery.data?.items.sort((a) => (a.isSystem ? -1 : 1)), [fieldsQuery])

  return (
    <>
      {showEditFieldModal && (
        <EditFieldModal field={showEditFieldModal} onClose={() => setShowEditFieldModal(undefined)} />
      )}
      {showCreateFieldModel && <CreateFieldModal onClose={() => setShowCreateFieldModel(false)} />}
      <Box>
        <Header>
          <Title>Manage Fields</Title>
        </Header>
        <Content>
          <ContentMain $padding={false}>
            <Intro>
              <p>Shown below are the fields are that available</p>
            </Intro>
            {fieldsQuery.isSuccess ? <Table data={fieldsSorted ?? []} rowKey={'id'} columns={columns} /> : null}
            <Actions>
              <StyledButton $primary={true} onClick={() => setShowCreateFieldModel(true)}>
                Add field
              </StyledButton>
            </Actions>
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default SettingsFields
