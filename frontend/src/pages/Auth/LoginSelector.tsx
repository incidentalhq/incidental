import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import email from '@/assets/icons/email.svg'
import slack from '@/assets/icons/slack.svg'
import logo from '@/assets/mark_noborder.png'
import Icon from '@/components/Icon/Icon'
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
    <Root data-testid="login-selector">
      <Logo src={logo} />
      <h2>Welcome</h2>
      <>
        <LoginButton to={RoutePaths.EMAIL_LOGIN}>
          <Icon icon={email} fixedWidth /> Email login
        </LoginButton>
        <LoginButton to={slackLoginQuery.data?.url ?? ''}>
          <Icon icon={slack} fixedWidth /> Slack login
        </LoginButton>
      </>
    </Root>
  )
}

export default LoginSelector
