import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns/format'
import { useMemo } from 'react'
import styled from 'styled-components'

import Table, { ColumnProperty } from '@/components/Table/Table'
import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { IOrganisationMember } from '@/types/models'

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

const SettingsMembers = () => {
  const { apiService } = useApiService()
  const { organisation } = useGlobal()

  const usersQuery = useQuery({
    queryKey: [organisation?.id, 'members'],
    queryFn: () => apiService.getOrganisationMembers()
  })

  const columns = useMemo(
    () =>
      [
        {
          name: 'Name',
          render: (v) => <Name>{v.user.name}</Name>
        },
        {
          name: 'Email',
          render: (v) => v.user.emailAddress
        },
        {
          name: 'Role',
          render: (v) => v.role
        },
        {
          name: 'Created',
          render: (v) => format(v.createdAt, 'do MMMM yyyy')
        },
        {
          name: '',
          render: () => <Controls></Controls>
        }
      ] as ColumnProperty<IOrganisationMember>[],
    []
  )

  return (
    <>
      <Box>
        <Header>
          <Title>Manage users</Title>
        </Header>
        <Content>
          <ContentMain $padding={false}>
            <Intro>
              <p>Shown below are the members of your organisation</p>
            </Intro>
            {usersQuery.isSuccess ? <Table data={usersQuery.data.items} rowKey={'id'} columns={columns} /> : null}
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default SettingsMembers
