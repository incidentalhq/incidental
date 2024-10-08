import { useQuery } from '@tanstack/react-query'
import { generatePath, Link } from 'react-router-dom'
import styled from 'styled-components'

import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { RoutePaths } from '@/routes'

const Intro = styled.div`
  padding: 1rem;
`
const FormsList = styled.div`
  display: flex;
`
const FormWrapper = styled(Link)`
  padding: 1rem;
  border: 1px solid var(--color-gray-100);
  margin: 1rem;
`

const SettingsFormsIndex = () => {
  const { apiService } = useApiService()
  const { organisation } = useGlobal()

  const formsQuery = useQuery({
    queryKey: [organisation?.id, 'forms'],
    queryFn: () => apiService.getForms()
  })

  return (
    <>
      <Box>
        <Header>
          <Title>Manage Forms</Title>
        </Header>
        <Content>
          <ContentMain $padding={false}>
            <Intro>
              <p>Shown below are the forms are that available</p>
            </Intro>

            <FormsList>
              {formsQuery.isSuccess &&
                formsQuery.data.items.map((form) => (
                  <FormWrapper
                    to={generatePath(RoutePaths.SETTINGS_FORMS_EDIT, {
                      id: form.id as string,
                      organisation: organisation!.slug
                    })}
                  >
                    <div>{form.name}</div>
                  </FormWrapper>
                ))}
            </FormsList>
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default SettingsFormsIndex
