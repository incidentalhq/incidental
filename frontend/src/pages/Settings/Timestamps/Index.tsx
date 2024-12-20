import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import trash from '@/assets/icons/trash.svg'
import ConfirmDelete from '@/components/Button/ConfirmDelete'
import Icon from '@/components/Icon/Icon'
import Table, { ColumnProperty } from '@/components/Table/Table'
import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import { StyledButton } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { ITimestamp } from '@/types/models'

import CreateTimestampModal from './CreateTimestampModal'

const Intro = styled.div`
  padding: 1rem;
`
const Event = styled.div`
  display: inline-block;
  background-color: var(--color-slate-100);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-slate-200);
  padding: 2px 5px;
  font-size: 12px;
`
const FirstOrLast = styled.div`
  display: inline-block;
  background-color: var(--color-green-50);
  border: 1px solid var(--color-green-200);
  padding: 2px 5px;
  border-radius: var(--radius-md);
`

const Actions = styled.div`
  padding: 1rem;
`

const SettingsTimestamps = () => {
  const { apiService } = useApiService()
  const [showCreateTimestampModal, setShowCreateTimestampModal] = useState(false)

  const timestampsQuery = useQuery({
    queryKey: ['timestamps'],
    queryFn: () => apiService.getTimestamps()
  })

  const deleteTimestampMutation = useMutation({
    mutationFn: (timestamp: ITimestamp) => apiService.deleteTimestamp(timestamp),
    onSuccess: async () => {
      timestampsQuery.refetch()
    },
    onError: (e) => {
      if (e instanceof APIError) {
        toast(e.detail, { type: 'error' })
      } else {
        toast('There was a problem archiving your custom timestamp')
      }
    },
    onSettled: () => {
      toast('Timestamp has been archived', { type: 'warning' })
    }
  })

  const columns = useMemo(
    () =>
      [
        {
          name: 'Name',
          render: (v) => v.label
        },
        {
          name: 'When this is set',
          render: (v) => {
            const rule = v.rules[0]
            const event = <Event>{rule.onEvent}</Event>

            switch (rule.onEvent) {
              case 'manual':
                return 'This is manually set'
              default:
                return (
                  <>
                    When {event} is triggered <FirstOrLast>{rule.first ? 'first' : 'last'}</FirstOrLast>
                  </>
                )
            }
          }
        },
        {
          name: '',
          render: (v) => {
            return (
              <div>
                {v.canDelete && (
                  <ConfirmDelete
                    onConfirm={() => deleteTimestampMutation.mutateAsync(v)}
                    message="Are you sure you want to delete this timestamp?"
                  >
                    <Icon icon={trash} />
                  </ConfirmDelete>
                )}
              </div>
            )
          }
        }
      ] as ColumnProperty<ITimestamp>[],
    [deleteTimestampMutation]
  )

  return (
    <>
      {showCreateTimestampModal && <CreateTimestampModal onClose={() => setShowCreateTimestampModal(false)} />}
      <Box>
        <Header>
          <Title>Manage Timestamps</Title>
        </Header>
        <Content>
          <ContentMain $padding={false}>
            <Intro>
              <p>These timestamps are automatically added to your incidents</p>
            </Intro>
            {timestampsQuery.isSuccess ? (
              <Table data={timestampsQuery.data.items} rowKey={'id'} columns={columns} />
            ) : (
              <p>No timestamps have been configured.</p>
            )}
            <Actions>
              <StyledButton $primary={true} onClick={() => setShowCreateTimestampModal(true)}>
                Add custom timestamp
              </StyledButton>
            </Actions>
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default SettingsTimestamps
