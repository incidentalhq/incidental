import { useQuery } from '@tanstack/react-query'

import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'

const SlackInstall = () => {
  const { apiService } = useApiService()

  const query = useQuery({
    queryKey: ['slack-app-install'],
    queryFn: () => apiService.slackAppInstallationUrl()
  })

  return (
    <>
      <Box>
        <Header>
          <Title>Install slack</Title>
        </Header>
        <Content>
          <ContentMain>
            <p>Before using this app, you must install the Slack application</p>
            <a href={query.data?.url}>install slack</a>
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default SlackInstall
