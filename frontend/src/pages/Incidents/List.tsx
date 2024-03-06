import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'

import { Box, Button, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'

import IncidentRow from './components/IncidentRow/IncidentRow'

const CategoryHeader = styled.div`
  padding: 1rem 20px;
  background-color: var(--color-gray-100);
`

const IncidentsList = () => {
  const { apiService } = useApiService()

  const activeIncidentsQuery = useQuery({
    queryKey: ['incidents'],
    queryFn: () => apiService.searchIncidents({})
  })

  const handleDeclare = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault()
  }

  return (
    <>
      <Box>
        <Header>
          <Title>Incidents</Title>
          <div>
            <Button $primary={true} onClick={handleDeclare}>
              Declare incident
            </Button>
          </div>
        </Header>
        <CategoryHeader>All incidents</CategoryHeader>
        <Content>
          <ContentMain $padding={false}>
            {activeIncidentsQuery.data?.items.map((it) => <IncidentRow key={it.id} incident={it} />)}
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default IncidentsList
