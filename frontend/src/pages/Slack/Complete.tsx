import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

import { Box, Content } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import { RoutePaths } from '@/routes'

const Root = styled.div`
  width: 30rem;
  margin: 10rem auto;

  > h2 {
    margin-bottom: 1rem;
  }
`

const SlackInstallComplete: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { apiService } = useApiService()
  const navigate = useNavigate()
  const client = useQueryClient()

  const processOauth = useCallback(
    async (code: string) => {
      await apiService.slackCompleteAppInstallation(code)
      await client.invalidateQueries({
        queryKey: ['world']
      })
      navigate(RoutePaths.DASHBOARD)
    },
    [apiService, navigate, client]
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
        <Content>Installing slack application...</Content>
      </Box>
    </Root>
  )
}

export default SlackInstallComplete
