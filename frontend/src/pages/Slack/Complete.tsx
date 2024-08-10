import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

import spinner from '@/assets/icons/spinner.svg'
import Icon from '@/components/Icon/Icon'
import { Box, Content } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import { useOrganisationSwitcher } from '@/hooks/useOrganisationSwitcher'
import { RoutePaths } from '@/routes'

const Root = styled.div`
  width: 30rem;
  margin: 10rem auto;

  > h2 {
    margin-bottom: 1rem;
  }
`
// User is redirected here after installing the Slack app
const SlackInstallComplete: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { apiService } = useApiService()
  const navigate = useNavigate()
  const { switchOrganisation } = useOrganisationSwitcher()
  const client = useQueryClient()

  const processOauth = useCallback(
    async (code: string) => {
      try {
        const response = await apiService.slackCompleteAppInstallation(code)
        await client.refetchQueries({
          queryKey: ['world']
        })
        switchOrganisation(response)
      } catch (e) {
        console.error(e)
      }
      navigate(RoutePaths.DASHBOARD)
    },
    [apiService, navigate, switchOrganisation, client]
  )

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      console.error('Unable to find code')
      return
    }
    processOauth(code)
  }, [searchParams, processOauth])

  return (
    <Root>
      <Box>
        <Content>
          <Icon spin={true} icon={spinner} /> Installing slack application...
        </Content>
      </Box>
    </Root>
  )
}

export default SlackInstallComplete
