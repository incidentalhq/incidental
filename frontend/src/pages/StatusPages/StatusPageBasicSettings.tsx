import { useMutation, useQuery } from '@tanstack/react-query'
import { FormikHelpers } from 'formik'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import Loading from '@/components/Loading/Loading'
import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { ModelID } from '@/types/models'
import { apiErrorsToFormikErrors } from '@/utils/form'

import BasicStatusPageSettingsForm, { FormValues } from './components/BasicStatusPageSettingsForm'

const CategoryHeader = styled.div`
  padding: 1rem 20px;
  background-color: var(--color-gray-100);
  font-weight: 500;
`

type UrlParams = {
  id: ModelID
}

const StatusPageBasicSettings = () => {
  const { apiService } = useApiService()
  const { id } = useParams() as UrlParams

  const {
    data: statusPage,
    isLoading,
    error
  } = useQuery({
    queryKey: ['get-status-page', id],
    queryFn: () => apiService.getStatusPage(id)
  })

  const mutateStatusPage = useMutation({
    mutationFn: (values: FormValues) => apiService.patchStatusPage(id, values),
    onSuccess: () => {
      toast('Status page updated', { type: 'success' })
    }
  })

  const handleSubmit = (values: FormValues, helpers: FormikHelpers<FormValues>) => {
    mutateStatusPage.mutate(values, {
      onError(error) {
        if (error instanceof APIError) {
          helpers.setErrors(apiErrorsToFormikErrors(error))
        }
      }
    })
  }

  return (
    <Box>
      <Header>
        <Title>Status Page Settings</Title>
      </Header>
      <CategoryHeader>Basic settings</CategoryHeader>
      <Content>
        <ContentMain>
          {isLoading && <Loading />}
          {statusPage && !isLoading && !error && (
            <BasicStatusPageSettingsForm onSubmit={handleSubmit} statusPage={statusPage} />
          )}
        </ContentMain>
      </Content>
    </Box>
  )
}

export default StatusPageBasicSettings
