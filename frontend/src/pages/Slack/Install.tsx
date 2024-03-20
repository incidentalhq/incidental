import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'

import slackMark from '@/assets/slack_mark.png'
import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'

const InstallSlackLink = styled.a`
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);

  img {
    width: 18px;
  }

  > div {
    align-items: center;
    gap: 0.5rem;
    display: flex;
  }
`

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
            <InstallSlackLink href={query.data?.url}>
              <div>
                <img src={slackMark} /> Install slack
              </div>
            </InstallSlackLink>
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default SlackInstall
