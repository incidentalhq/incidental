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
import { IIncidentType } from '@/types/models'

import CreateIncidentTypeModal from './CreateIncidentTypeModal'
import UpdateIncidentTypeModal from './UpdateIncidentTypeModal'

const Intro = styled.div`
  padding: 1rem;
`
const Name = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
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

const SettingsIncidentTypes = () => {
  const { apiService } = useApiService()
  const { organisation } = useGlobal()
  const [showCreateIncidentTypeModal, setShowIncidentTypeModal] = useState(false)
  const [showUpdateIncidentTypeModal, setUpdateEditIncidentTypeModal] = useState<IIncidentType>()

  const incidentTypesQuery = useQuery({
    queryKey: ['types', organisation?.id],
    queryFn: () => apiService.getIncidentTypes()
  })
  const fieldsQuery = useQuery({
    queryKey: ['fields', organisation?.id],
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

  const columns = useMemo(
    () =>
      [
        {
          name: 'Name',
          render: (v) => (
            <Name>
              {v.name} {v.isDefault ? <Pill>Default</Pill> : null}
            </Name>
          )
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
                  onClick={() => setUpdateEditIncidentTypeModal(v)}
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
    [handleDelete, setUpdateEditIncidentTypeModal]
  )

  return (
    <>
      {showCreateIncidentTypeModal && (
        <CreateIncidentTypeModal
          fields={fieldsQuery.data?.items || []}
          onClose={() => setShowIncidentTypeModal(false)}
        />
      )}
      {showUpdateIncidentTypeModal && (
        <UpdateIncidentTypeModal
          fields={fieldsQuery.data?.items || []}
          incidentType={showUpdateIncidentTypeModal}
          onClose={() => setUpdateEditIncidentTypeModal(undefined)}
        />
      )}
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
              <StyledButton $primary={true} onClick={() => setShowIncidentTypeModal(true)}>
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
