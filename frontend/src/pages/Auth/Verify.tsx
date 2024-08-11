import React, { useCallback } from 'react'
import { Link } from 'react-router-dom'

import logo from '@/assets/mark_noborder.png'
import { Box } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'

import { Content, FooterMessage, Logo, Root } from './styles'

const Verify: React.FC = () => {
  const [verified, setVerified] = React.useState(false)
  const [error, setError] = React.useState('')
  const { apiService } = useApiService()

  const params = new URLSearchParams(location.search)
  const code = params.get('code')
  const email = params.get('email')

  const verifyAccount = useCallback(async () => {
    if (!code || !email) {
      return
    }

    try {
      await apiService.verifyAccount(email, code)
      setVerified(true)
    } catch (e) {
      if (e instanceof APIError) {
        setError(e.detail)
      }
    }
  }, [apiService, setVerified, setError, code, email])

  React.useEffect(() => {
    verifyAccount()
  }, [verifyAccount])

  return (
    <Root>
      <Logo src={logo} />
      <h2>Verify your account</h2>
      <Box>
        <Content data-testid="login-page">
          <center>
            {verified && 'Your account has been verified, please login'}
            {error != '' && error}
            {error == '' && !verified && 'Verifying your account'}
          </center>
        </Content>
      </Box>
      <FooterMessage>
        <Link to={'/login'}>Login</Link>
        <Link to={'/verify/send'}>Resend verification code</Link>
      </FooterMessage>
    </Root>
  )
}

export default Verify
