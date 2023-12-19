import { useQuery } from '@tanstack/react-query'

import logo from '@/assets/mark_noborder.png'
import useApiService from '@/hooks/useApi'

import { Content, Logo, Root } from './styles'

const SlackLogin: React.FC = () => {
  const { apiService } = useApiService()
  const slackLoginQuery = useQuery({
    queryKey: ['slack-login-url'],
    queryFn: () => apiService.slackLoginUrl()
  })

  return (
    <Root>
      <Logo src={logo} />
      <h2>Login</h2>
      <Content>
        <a href={slackLoginQuery.data?.url}>Login with Slack</a>
      </Content>
    </Root>
  )
}

export default SlackLogin
