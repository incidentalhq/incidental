import { faSlack } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import logo from '@/assets/mark_noborder.png'
import useApiService from '@/hooks/useApi'
import { RoutePaths } from '@/routes'

import { Logo, Root } from './styles'

const LoginButton = styled(Link)`
  padding: 1rem;
  display: flex;
  margin: 1rem;
  background-color: #fff;
  border: 1px solid var(--color-gray-300);
  gap: 1rem;
  align-items: center;
  justify-content: center;
`

const LoginSelector: React.FC = () => {
  const { apiService } = useApiService()
  const slackLoginQuery = useQuery({
    queryKey: ['slack-login-url'],
    queryFn: () => apiService.slackLoginUrl()
  })
  return (
    <Root>
      <Logo src={logo} />
      <>
        <LoginButton to={RoutePaths.EMAIL_LOGIN}>
          <FontAwesomeIcon icon={faEnvelope} fixedWidth /> Email login
        </LoginButton>
        <LoginButton to={slackLoginQuery.data?.url ?? ''}>
          <FontAwesomeIcon icon={faSlack} fixedWidth />
          Slack login
        </LoginButton>
      </>
    </Root>
  )
}

export default LoginSelector
