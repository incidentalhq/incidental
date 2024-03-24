import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import slackMark from '@/assets/slack_mark.png'
import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { RoutePaths } from '@/routes'

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
  const { organisation } = useGlobal()
  const navigate = useNavigate()

  const query = useQuery({
    queryKey: ['slack-app-install'],
    queryFn: () => apiService.slackAppInstallationUrl()
  })

  useEffect(() => {
    if (!organisation) {
      return
    }
    if (organisation.slackAppInstalled) {
      navigate(RoutePaths.DASHBOARD)
    }
  }, [organisation, navigate])

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
