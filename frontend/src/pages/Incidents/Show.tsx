import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { MouseEvent, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import slack from '@/assets/icons/slack.svg'
import wrench from '@/assets/icons/wrench.svg'
import Icon from '@/components/Icon/Icon'
import Loading from '@/components/Loading/Loading'
import { useModal } from '@/components/Modal/useModal'
import { Box, Content, ContentMain, ContentSidebar, Header, Title } from '@/components/Theme/Styles'
import MiniAvatar from '@/components/User/MiniAvatar'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { APIError } from '@/services/transport'
import { rankSorter } from '@/utils/sort'
import { getLocalTimeZone } from '@/utils/time'

import ChangeSeverityForm, {
  FormValues as ChangeSeverityFormValues
} from './components/ChangeSeverityForm/ChangeSeverityForm'
import ChangeStatusForm, { FormValues as ChangeStatusFormValues } from './components/ChangeStatusForm/ChangeStatusForm'
import EditDescriptionForm, { FormValues } from './components/EditDescriptionForm/EditDescriptionForm'
import EditTitleForm, { FormValues as ChangeNameFormValues } from './components/EditTitleForm/EditTitleForm'
import Timeline from './components/IncidentUpdate/Timeline'
import EditTimestampsForm, { FormValues as TimestampFormValues } from './components/Timestamps/EditTimestampsForm'

const Description = styled.div`
  margin-bottom: 2rem;
`

const Field = styled.div`
  display: flex;
  padding: 1rem 0 0.5rem 1rem;
`
const FieldName = styled.div`
  width: 90px;
`
const FieldValue = styled.div`
  display: flex;
  gap: 8px;
`
const ModalContainer = styled.div`
  padding: 1rem;
`
const FlatButton = styled.button`
  border: none;
  padding: 0.25rem 1rem;

  &:hover {
    background-color: var(--color-gray-200);
  }
`
const SidebarHeader = styled.div`
  padding: 1rem 0 0 1rem;
  font-weight: 500;
  color: var(--color-gray-400);

  display: flex;

  & > :first-child {
    width: 90px;
  }
`
const RelatedFields = styled.div`
  ${Field} {
    padding-bottom: 0;
  }
`

const FlatEdit = styled.a``

type UrlParams = {
  id: string
}

const ShowIncident = () => {
  const { apiService } = useApiService()
  const { id } = useParams<UrlParams>() as UrlParams
  const { setModal, closeModal } = useModal()
  const { statusList, severityList, organisation } = useGlobal()

  // Incident state
  const incidentQuery = useQuery({
    queryKey: ['incident', id],
    queryFn: () => apiService.getIncident(id)
  })

  // Incident updates state
  const incidentUpdatesQuery = useQuery({
    queryKey: ['incident-updates', id],
    queryFn: () => apiService.getIncidentUpdates(id)
  })

  // Change description of this incident
  const handleChangeDescription = useCallback(
    async (values: FormValues) => {
      await apiService.patchIncident(id, {
        description: values.description
      })
      incidentQuery.refetch()
    },
    [id, apiService, incidentQuery]
  )

  // Change the status of this incident
  const handleChangeStatus = async (values: ChangeStatusFormValues) => {
    await apiService.patchIncident(id, {
      incidentStatus: {
        id: values.status
      }
    })
    incidentQuery.refetch()
    closeModal()
  }

  const handleChangeSeverity = async (values: ChangeSeverityFormValues) => {
    await apiService.patchIncident(id, {
      incidentSeverity: {
        id: values.severity
      }
    })
    incidentQuery.refetch()
    closeModal()
  }

  // Show modal when edit status is clicked
  const handleEditStatus = (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault()
    if (!incidentQuery.data) {
      return
    }
    setModal(
      <ModalContainer>
        <h2>Change status</h2>
        <p>Update the status of your incident</p>
        <ChangeStatusForm statusList={statusList} incident={incidentQuery.data} onSubmit={handleChangeStatus} />
      </ModalContainer>
    )
  }

  const handleEditSeverity = (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault()
    if (!incidentQuery.data) {
      return
    }
    setModal(
      <ModalContainer>
        <h2>Change severity</h2>
        <ChangeSeverityForm severityList={severityList} incident={incidentQuery.data} onSubmit={handleChangeSeverity} />
      </ModalContainer>
    )
  }

  const handleChangeName = useCallback(
    async (values: ChangeNameFormValues) => {
      await apiService.patchIncident(id, {
        name: values.name
      })
      incidentQuery.refetch()
    },
    [apiService, id, incidentQuery]
  )

  const handleUpdateTimestampValues = useCallback(
    async (values: TimestampFormValues) => {
      try {
        const normalizedValues = Object.keys(values).reduce(
          (prev, key) => {
            const value = values[key as keyof TimestampFormValues]
            if (value === '') {
              prev[key] = null
            } else {
              prev[key] = value
            }
            return prev
          },
          {} as Record<string, string | null>
        )
        await apiService.patchTimestampValues(incidentQuery.data!, normalizedValues, getLocalTimeZone())
        toast('Timestamps updated', { type: 'success' })
        incidentQuery.refetch()
        closeModal()
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.detail, { type: 'error' })
        } else {
          toast('There was a problem updating timestamps', { type: 'error' })
        }
      }
    },
    [apiService, incidentQuery, closeModal]
  )

  const handleShowEditTimestampsModal = useCallback(
    (evt: MouseEvent<HTMLAnchorElement>) => {
      evt.preventDefault()
      setModal(
        <ModalContainer>
          <h2>Set timestamps</h2>
          <p>Customise timestamps</p>
          <p>
            Timestamps are shown in your local timezone: <b>{getLocalTimeZone()}</b>
          </p>
          <br />
          <EditTimestampsForm incident={incidentQuery.data!} onSubmit={handleUpdateTimestampValues} />
        </ModalContainer>
      )
    },
    [incidentQuery.data, setModal, handleUpdateTimestampValues]
  )

  const slackUrl = `slack://channel?team=${organisation?.slackTeamId}&id=${incidentQuery.data?.slackChannelId}`

  return (
    <>
      <Box>
        {incidentQuery.isLoading && <Loading />}
        {incidentQuery.isSuccess ? (
          <>
            <Header>
              <Title>
                <EditTitleForm incident={incidentQuery.data} onSubmit={handleChangeName} />
              </Title>
            </Header>
            <Content>
              <ContentMain>
                <h3>Description</h3>
                <Description>
                  <EditDescriptionForm incident={incidentQuery.data} onSubmit={handleChangeDescription} />
                </Description>

                <h3>Updates</h3>
                {incidentUpdatesQuery.isSuccess ? (
                  <Timeline updates={incidentUpdatesQuery.data.items} />
                ) : (
                  <p>There was an issue </p>
                )}
              </ContentMain>
              <ContentSidebar>
                <Field>
                  <FieldName>Slack</FieldName>
                  <FieldValue>
                    <a href={slackUrl} target="_blank">
                      <Icon icon={slack} fixedWidth /> Open channel
                    </a>
                  </FieldValue>
                </Field>
                <Field>
                  <FieldName>Status</FieldName>
                  <FieldValue>
                    <FlatButton type="button" onClick={handleEditStatus}>
                      {incidentQuery.data.incidentStatus.name}
                    </FlatButton>
                  </FieldValue>
                </Field>
                <Field>
                  <FieldName>Severity</FieldName>
                  <FieldValue>
                    <FlatButton type="button" onClick={handleEditSeverity}>
                      {incidentQuery.data.incidentSeverity.name}
                    </FlatButton>
                  </FieldValue>
                </Field>
                <Field>
                  <FieldName>Type</FieldName>
                  <FieldValue>{incidentQuery.data.incidentType.name}</FieldValue>
                </Field>
                {incidentQuery.data.incidentRoleAssignments.map((it) => (
                  <Field key={it.id}>
                    <FieldName>{it.incidentRole.name}</FieldName>
                    <FieldValue>
                      <MiniAvatar user={it.user} /> {it.user.name}
                    </FieldValue>
                  </Field>
                ))}

                <SidebarHeader>
                  <div>Timestamps</div>
                  <div>
                    <FlatEdit href="#" onClick={handleShowEditTimestampsModal}>
                      <Icon icon={wrench} />
                    </FlatEdit>
                  </div>
                </SidebarHeader>
                <RelatedFields>
                  {incidentQuery.data.timestampValues
                    .sort((a, b) => rankSorter(a.timestamp, b.timestamp))
                    .map((it) => (
                      <Field key={it.id}>
                        <FieldName>{it.timestamp.label}</FieldName>
                        <FieldValue>{format(it.value, 'dd MMM yyyy h:mmaaa')}</FieldValue>
                      </Field>
                    ))}
                </RelatedFields>
              </ContentSidebar>
            </Content>
          </>
        ) : null}
      </Box>
    </>
  )
}

export default ShowIncident
