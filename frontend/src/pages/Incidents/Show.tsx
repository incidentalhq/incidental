import { faSlack } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { MouseEvent, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import Loading from '@/components/Loading/Loading'
import { useModal } from '@/components/Modal/useModal'
import { Box, Content, ContentMain, ContentSidebar, Header, Title } from '@/components/Theme/Styles'
import MiniAvatar from '@/components/User/MiniAvatar'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'

import ChangeSeverityForm, {
  FormValues as ChangeSeverityFormValues
} from './components/ChangeSeverityForm/ChangeSeverityForm'
import ChangeStatusForm, { FormValues as ChangeStatusFormValues } from './components/ChangeStatusForm/ChangeStatusForm'
import EditDescriptionForm, { FormValues } from './components/EditDescriptionForm/EditDescriptionForm'
import Timeline from './components/IncidentUpdate/Timeline'

const Description = styled.div`
  margin-bottom: 2rem;
`

const Field = styled.div`
  display: flex;
  padding: 1rem;
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

  const slackUrl = `slack:/channel?team=${organisation?.slackTeamId}&id=${incidentQuery.data?.slackChannelId}`

  return (
    <>
      <Box>
        {incidentQuery.isLoading && <Loading />}
        {incidentQuery.isSuccess ? (
          <>
            <Header>
              <Title>{incidentQuery.data.name}</Title>
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
                      <FontAwesomeIcon icon={faSlack} fixedWidth /> Open channel
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
                <Field>
                  <FieldName>Reported at</FieldName>
                  <FieldValue>{format(incidentQuery.data.createdAt, 'd MMM yyyy K:maaa')}</FieldValue>
                </Field>
              </ContentSidebar>
            </Content>
          </>
        ) : null}
      </Box>
    </>
  )
}

export default ShowIncident
