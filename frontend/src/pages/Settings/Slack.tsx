import { useQuery } from '@tanstack/react-query'
import { FormikHelpers } from 'formik'
import { useCallback } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { APIError } from '@/services/transport'
import { apiErrorsToFormikErrors } from '@/utils/form'

import SlackChannelNameForm, { FormValues as SlackChannelFormValues } from './components/SlackChannelNameForm'

const Intro = styled.div`
  margin-bottom: 1rem;
`

const SettingsSlack = () => {
  const { apiService } = useApiService()
  const { organisation } = useGlobal()

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiService.getSettings(organisation!)
  })

  const handleSubmit = useCallback(
    async (values: SlackChannelFormValues, helpers: FormikHelpers<SlackChannelFormValues>) => {
      if (!organisation) {
        return
      }
      try {
        await apiService.updateSettings(organisation, values)
        toast('Slack settings updated', { type: 'success' })
      } catch (e) {
        if (e instanceof APIError) {
          helpers.setErrors(apiErrorsToFormikErrors(e))
          toast(e.detail, { type: 'error' })
        }
      }
    },
    [organisation, apiService]
  )

  return (
    <>
      <Box>
        <Header>
          <Title>Manage Slack</Title>
        </Header>
        <Content>
          <ContentMain>
            <Intro>
              <p>Configure your integration with Slack</p>
            </Intro>
            {settingsQuery.isSuccess ? (
              <SlackChannelNameForm onSubmit={handleSubmit} settings={settingsQuery.data} />
            ) : null}
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default SettingsSlack
