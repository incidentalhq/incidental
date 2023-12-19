import { useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

import { Box, Content } from '@/components/Theme/Styles'
import useAuth from '@/hooks/useAuth'
import { RoutePaths } from '@/routes'

const Root = styled.div`
  width: 30rem;
  margin: 10rem auto;

  > h2 {
    margin-bottom: 1rem;
  }
`

const OAuthComplete: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { slackLogin } = useAuth()
  const navigate = useNavigate()

  const processOauth = useCallback(
    async (code: string) => {
      await slackLogin(code)
      navigate(RoutePaths.DASHBOARD)
    },
    [slackLogin, navigate]
  )

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      console.error('Unable to find code')
      return
    }

    processOauth(code)
  }, [searchParams, slackLogin, processOauth])

  return (
    <Root>
      <Box>
        <Content>Logging in...</Content>
      </Box>
    </Root>
  )
}

export default OAuthComplete
