import { useMutation, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns/format'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

import paperPlane from '@/assets/icons/paper-plane.svg'
import trash from '@/assets/icons/trash.svg'
import userPlus from '@/assets/icons/user-plus.svg'
import Button from '@/components/Button/Button'
import ConfirmDelete from '@/components/Button/ConfirmDelete'
import Icon from '@/components/Icon/Icon'
import Table, { ColumnProperty } from '@/components/Table/Table'
import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { IInvite, IOrganisationMember, ModelID } from '@/types/models'

import CreateInviteModal from './CreateInviteModal'

const Intro = styled.div`
  padding: 1rem;
`
const Name = styled.div``
const InvitedName = styled.div`
  font-style: italic;
  color: var(--color-gray-500);
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

type InviteOrMember = {
  type: 'invite' | 'member'
  invite?: IInvite
  member?: IOrganisationMember
}

const SettingsMembersIndex = () => {
  const [showCreateInviteModal, setShowCreateInviteModal] = useState(false)
  const { apiService } = useApiService()
  const { organisation } = useGlobal()

  const usersQuery = useQuery({
    queryKey: [organisation?.id, 'members'],
    queryFn: () => apiService.getOrganisationMembers()
  })

  const invitesQuery = useQuery({
    queryKey: [organisation?.id, 'invites'],
    queryFn: () => apiService.getOrganisationInvites()
  })

  const deleteInviteMutation = useMutation({
    mutationFn: (id: ModelID) => apiService.deleteInvite(id),
    onSuccess: () => {
      invitesQuery.refetch()
    }
  })

  const memberColumns = useMemo(
    () =>
      [
        {
          name: 'Name',
          render: (v) => {
            if (v.invite) {
              return (
                <InvitedName>
                  <Icon icon={paperPlane} /> Invite sent to user
                </InvitedName>
              )
            }
            if (v.member) {
              return <Name>{v.member.user.name}</Name>
            }
          }
        },
        {
          name: 'Email',
          render: (v) => (v.invite ? v.invite.emailAddress : v.member?.user.emailAddress)
        },
        {
          name: 'Role',
          render: (v) => (v.invite ? v.invite.role : v.member?.role)
        },
        {
          name: 'Status',
          render: (v) => {
            if (v.invite) {
              return 'Invited'
            }
            if (v.member) {
              return 'Active'
            }
          }
        },
        {
          name: 'Joined',
          render: (v) => {
            const dateFormat = 'dd MMM yyyy'
            if (v.invite) {
              return format(new Date(v.invite.createdAt), dateFormat)
            }
            if (v.member) {
              return format(new Date(v.member.createdAt), dateFormat)
            }
          }
        },
        {
          name: '',
          render: (v) => (
            <Controls>
              {v.invite && (
                <div>
                  <ConfirmDelete
                    title="Delete user"
                    message="Are you sure you want to delete this user?"
                    onConfirm={() => v.invite && deleteInviteMutation.mutate(v.invite.id)}
                  >
                    <Icon icon={trash} />
                  </ConfirmDelete>
                </div>
              )}
            </Controls>
          )
        }
      ] as ColumnProperty<InviteOrMember>[],
    [deleteInviteMutation]
  )

  // Combine invites and users into a single array
  const invitesAndUsers = useMemo(() => {
    if (invitesQuery.isSuccess && usersQuery.isSuccess) {
      return [
        ...usersQuery.data.items.map((it) => ({
          type: 'member',
          member: it
        })),
        ...invitesQuery.data.items.map((it) => ({
          type: 'invite',
          invite: it
        }))
      ] as InviteOrMember[]
    }

    return []
  }, [invitesQuery.isSuccess, invitesQuery.data, usersQuery.isSuccess, usersQuery.data])

  return (
    <>
      {showCreateInviteModal ? (
        <CreateInviteModal organisation={organisation!} onClose={() => setShowCreateInviteModal(false)} />
      ) : null}
      <Box>
        <Header>
          <Title>Manage users</Title>
          <div>
            <Button onClick={() => setShowCreateInviteModal(true)}>
              <Icon icon={userPlus} /> Invite user
            </Button>
          </div>
        </Header>
        <Content>
          <ContentMain $padding={false}>
            <Intro>
              <p>Shown below are the members of your organisation</p>
            </Intro>
            {usersQuery.isSuccess ? (
              <Table
                data={invitesAndUsers}
                rowKey={(it) => (it.invite ? it.invite.id : it.member ? it.member.id : '-1')}
                columns={memberColumns}
              />
            ) : null}
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default SettingsMembersIndex
