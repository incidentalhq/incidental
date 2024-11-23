import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import Loading from '@/components/Loading/Loading'
import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import { ModelID } from '@/types/models'

import DomainSettingsForm, { FormValues } from './components/DomainSettingsForm'

const CategoryHeader = styled.div`
  padding: 1rem 20px;
  background-color: var(--color-gray-100);
  font-weight: 500;
`
const DomainNotVerified = styled.div`
  margin-top: 2rem;
  padding: 1rem 20px;
  background-color: var(--color-red-100);
  h3 {
    margin-bottom: 1rem;
  }
`
const DomainVerified = styled.div`
  margin-top: 2rem;
  padding: 1rem 20px;
  background-color: var(--color-green-100);
`
const DomainVerificationInstructions = styled.div`
  table {
    border-collapse: collapse;
    border-spacing: 0;
    margin-top: 1rem;
  }

  table th {
    text-align: left;
    padding-right: 1rem;
  }

  table td {
    padding-right: 1rem;
  }
`

type UrlParams = {
  id: ModelID
}

const StatusPageDomainSettings = () => {
  const { apiService } = useApiService()
  const { id } = useParams() as UrlParams
  const queryClient = useQueryClient()

  const {
    data: statusPage,
    isLoading,
    error
  } = useQuery({
    queryKey: ['get-status-page', id],
    queryFn: () => apiService.getStatusPage(id)
  })

  const statusPageDomainStatusQuery = useQuery({
    queryKey: ['get-status-page-domain-status', id],
    queryFn: () => apiService.getStatusPageDomainStatus(id)
  })

  const updateDomainMutation = useMutation({
    mutationFn: (values: FormValues) => {
      return apiService.updateStatusPageDomain(id, values)
    },
    onSuccess: () => {
      toast('Custom domain updated', { type: 'success' })
    }
  })

  const deleteDomainMutation = useMutation({
    mutationFn: () => apiService.updateStatusPageDomain(id, { customDomain: null }),
    onSuccess: () => {
      toast('Custom domain removed', { type: 'success' })
      queryClient.invalidateQueries({
        queryKey: ['get-status-page', id]
      })
    }
  })

  const handleSubmit = (values: FormValues) => {
    return updateDomainMutation.mutateAsync(values)
  }

  return (
    <Box>
      <Header>
        <Title>Status Page Custom Domain</Title>
      </Header>
      <CategoryHeader>Domain</CategoryHeader>
      <Content>
        <ContentMain>
          {isLoading && <Loading />}
          {statusPage && !isLoading && !error && (
            <DomainSettingsForm
              onSubmit={handleSubmit}
              statusPage={statusPage}
              onDelete={() => deleteDomainMutation.mutate()}
            />
          )}

          {statusPageDomainStatusQuery.data && (
            <div>
              {statusPageDomainStatusQuery.data.isVerified ? (
                <DomainVerified>Domain is verified</DomainVerified>
              ) : (
                <DomainNotVerified>
                  <h3>Domain is not verified</h3>
                  <DomainVerificationInstructions>
                    <p>Set the following on your DNS provider to continue:</p>
                    <table>
                      <tr>
                        <th>Type</th>
                        <th>Name</th>
                        <th>Value</th>
                      </tr>
                      <tr>
                        <td>CNAME</td>
                        <td>{statusPage?.customDomain}</td>
                        <td>statuspage.incidental.dev</td>
                      </tr>
                    </table>
                  </DomainVerificationInstructions>
                </DomainNotVerified>
              )}
            </div>
          )}
        </ContentMain>
      </Content>
    </Box>
  )
}

export default StatusPageDomainSettings
