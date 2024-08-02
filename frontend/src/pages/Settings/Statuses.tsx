import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { toast } from 'react-toastify'
import styled, { css } from 'styled-components'

import Loading from '@/components/Loading/Loading'
import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { APIError } from '@/services/transport'
import { IncidentStatusCategory } from '@/types/enums'
import { IIncidentStatus } from '@/types/models'

import TriageToggleForm, { FormValues } from './components/TriageToggleForm'

const FormContainer = styled.div`
  border: 1px solid var(--color-gray-100);
  padding: 1rem;
  margin-bottom: 1rem;
`
const Intro = styled.div``
const StatusList = styled.div`
  position: relative;
`

type CategoryProps = {
  $disabled?: boolean
}

const disabledCategoryCss = css``
const Category = styled.div<CategoryProps>`
  ${(props) => (props.$disabled ? disabledCategoryCss : null)}
`
const CategoryHeader = styled.div`
  z-index: 99;
  background-color: var(--color-gray-100);
  padding: 10px 16px;
  display: inline-block;
  font-weight: 600;
`
const CategoryStatuses = styled.div`
  margin: 0 0 1rem 0;
  border-top: 0;
  display: flex;
  gap: 3rem;
  flex-direction: row;
  padding: 1rem;
  background-color: var(--color-gray-100);
`
const Status = styled.div`
  padding: 1rem 16px;
  background-color: #fff;
  position: relative;
  box-shadow: 0px 3px 4px var(--color-slate-200);

  --size: 1.8rem;

  &:after {
    position: absolute;
    right: calc(-1 * var(--size) + 1px);
    top: 0;

    content: '';
    width: 0px;
    height: 0px;
    border-style: solid;
    border-width: var(--size) 0 var(--size) var(--size);
    border-color: transparent transparent transparent #fff;
    transform: rotate(0deg);
  }
`
const Divider = styled.div`
  border-top: 1px solid var(--color-slate-200);
  margin: 3rem 0;
`
const Settings = styled.div`
  h3 {
    margin-bottom: 1rem;
  }
  p {
    margin-bottom: 1rem;
  }
`

// order the categories
const CATEGORIES: Array<IncidentStatusCategory> = [
  IncidentStatusCategory.TRIAGE,
  IncidentStatusCategory.ACTIVE,
  IncidentStatusCategory.POST_INCIDENT,
  IncidentStatusCategory.CLOSED
]

const humanizedCategoryName = (category: IncidentStatusCategory) => {
  switch (category) {
    case IncidentStatusCategory.TRIAGE:
      return 'Triage'
    case IncidentStatusCategory.ACTIVE:
      return 'Active'
    case IncidentStatusCategory.POST_INCIDENT:
      return 'Post Incident'
    case IncidentStatusCategory.CLOSED:
      return 'Closed'
  }
}

const SettingsStatuses = () => {
  const { organisation } = useGlobal()
  const { apiService } = useApiService()

  const statusesQuery = useQuery({
    queryKey: ['statuses', organisation!.id],
    queryFn: () => apiService.getIncidentStatuses()
  })

  const lifecycleQuery = useQuery({
    queryKey: ['lifecycle', organisation!.id],
    queryFn: () => apiService.getLifecycle()
  })

  const handleSubmit = async (values: FormValues) => {
    if (!lifecycleQuery.data) {
      return
    }
    try {
      await apiService.patchLifecycle(lifecycleQuery.data, values)
      lifecycleQuery.refetch()
    } catch (e) {
      if (e instanceof APIError) {
        toast(e.detail, { type: 'error' })
      }
      console.error(e)
    }
  }

  // group the statuses by categories above, whilst preserving ordering of categories
  const groupedStatuses = useMemo(
    () =>
      CATEGORIES.reduce(
        (prev, current) => {
          const statuses = statusesQuery.data?.items.filter((it) => it.category == current) ?? []
          prev[current] = statuses
          return prev
        },
        {} as Record<IncidentStatusCategory, Array<IIncidentStatus>>
      ),
    [statusesQuery]
  )

  return (
    <>
      <Box>
        <Header>
          <Title>Manage Statuses</Title>
        </Header>
        <Content>
          <ContentMain>
            <Settings>
              <h3>Triage settings</h3>
              <Intro>
                <p>
                  Triage is for initial assessment and prioritization. Use this to evaluate and categorize new incidents
                  before committing resources. By turning this on, users will have the option to create incidents in the
                  Triage state.
                </p>
              </Intro>
            </Settings>

            {lifecycleQuery.isSuccess ? (
              <FormContainer>
                <TriageToggleForm onSubmit={handleSubmit} lifecycle={lifecycleQuery.data} />
              </FormContainer>
            ) : null}

            <Divider />

            <Settings>
              <h3>Status lifecycle</h3>
              <Intro>
                <p>
                  Incidents progress through these statuses as they are managed. They typically start in Triage (if
                  enabled) or Active, move through investigation and resolution phases, and end in Post-Incident review
                  before being Closed. The flow may vary based on the incident's nature and your team's processes.
                </p>
              </Intro>
            </Settings>

            {statusesQuery.isSuccess && lifecycleQuery.isSuccess ? (
              <StatusList>
                <AnimatePresence initial={false}>
                  {CATEGORIES.map((category) => {
                    const isDisabled =
                      lifecycleQuery.data?.isTriageAvailable === false && category === IncidentStatusCategory.TRIAGE

                    if (isDisabled) {
                      return null
                    }
                    return (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Category $disabled={isDisabled}>
                          <CategoryHeader>{humanizedCategoryName(category)}</CategoryHeader>
                          <CategoryStatuses>
                            {groupedStatuses[category].map((status) => {
                              return <Status key={status.id}>{status.name}</Status>
                            })}
                          </CategoryStatuses>
                        </Category>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </StatusList>
            ) : (
              <Loading />
            )}
          </ContentMain>
        </Content>
      </Box>
    </>
  )
}

export default SettingsStatuses
