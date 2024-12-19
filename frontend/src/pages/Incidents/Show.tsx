import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { MouseEvent, useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import slack from '@/assets/icons/slack.svg'
import wrench from '@/assets/icons/wrench.svg'
import Button from '@/components/Button/Button'
import Icon from '@/components/Icon/Icon'
import Loading from '@/components/Loading/Loading'
import { useModal } from '@/components/Modal/useModal'
import { Box, Content, ContentMain, Header, Title } from '@/components/Theme/Styles'
import Timeline from '@/components/Timeline/Timeline'
import MiniAvatar from '@/components/User/MiniAvatar'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { APIError } from '@/services/transport'
import { IncidentRoleKind } from '@/types/enums'
import { IField, IIncidentFieldValue, IIncidentRole } from '@/types/models'
import { rankSorter } from '@/utils/sort'

import ChangeSeverityForm, {
  FormValues as ChangeSeverityFormValues
} from './components/ChangeSeverityForm/ChangeSeverityForm'
import EditDescriptionForm, { FormValues } from './components/EditDescriptionForm/EditDescriptionForm'
import EditTitleForm, { FormValues as ChangeNameFormValues } from './components/EditTitleForm/EditTitleForm'
import DisplayFieldValue from './components/Field/DisplayFieldValue'
import FieldForm, { FormValues as FieldFormValues } from './components/Field/FieldForm'
import IncidentUpdate from './components/IncidentUpdate/IncidentUpdate'
import RoleForm, { FormValues as RoleFormValues } from './components/RoleForm/RoleForm'

import ShareUpdateModal from './modals/ShareUpdateModal'
import UpdateIncidentStatusModal from './modals/UpdateIncidentStatusModal'
import UpdateIncidentTimestampsModal from './modals/UpdateIncidentTimestampsModal'

const Description = styled.div`
  margin-bottom: 2rem;
`

const Field = styled.div`
  display: flex;
  padding: 0 0 0 1rem;
  align-items: center;
`
const FieldName = styled.div`
  width: 90px;
  margin-right: 1rem;
`
const FieldValue = styled.div`
  display: flex;
  gap: 8px;
`
const ModalContainer = styled.div`
  padding: 1rem;
  min-width: 400px;
  max-width: 400px;
`
const FlatButton = styled.button`
  border: none;
  padding: 0.25rem 1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  background-color: var(--color-gray-100);

  &:hover {
    background-color: var(--color-gray-200);
  }
`
const FieldsHeader = styled.div`
  margin: 2rem 0 1rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  align-items: center;
  color: var(--color-gray-600);

  display: flex;

  & > :first-child {
    width: 90px;
    margin-right: 1rem;
  }
`
const RelatedFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`
const InnerButtonContent = styled.div`
  display: flex;
  gap: 8px;
`
const PaddedValue = styled.div`
  display: flex;
  gap: 8px;
  padding: 0.25rem 1rem;
`
const ContentSidebar = styled.div`
  flex-grow: 1;
  max-width: 480px;
  min-width: 320px;
  background-color: var(--color-gray-50);
  padding: 1rem;
  height: 100vh;
`
const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
`
const ContentSection = styled.div`
  padding-bottom: 3rem;
  border-bottom: 1px solid var(--color-slate-200);
  margin-bottom: 1rem;
`

type UrlParams = {
  id: string
}

const ShowIncident = () => {
  const { apiService } = useApiService()
  const { id } = useParams<UrlParams>() as UrlParams
  const { setModal, closeModal } = useModal()
  const { organisation } = useGlobal()
  const [showShareUpdateModal, setShowShareUpdateModal] = useState(false)
  const [showUpdateIncidentStatusModal, setShowUpdateIncidentStatusModal] = useState(false)
  const [showUpdateTimestampsModal, setShowUpdateTimestampsModal] = useState(false)

  // Incident severities
  const severitiesQuery = useQuery({
    queryKey: ['severities', organisation!.id],
    queryFn: () => apiService.getIncidentSeverities()
  })

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

  // Fetch roles available for the organisation
  const rolesQuery = useQuery({
    queryKey: ['roles', organisation!.id],
    queryFn: () => apiService.getRoles()
  })

  // Fetch roles available for the organisation
  const usersQuery = useQuery({
    queryKey: ['users', organisation!.id],
    queryFn: () => apiService.getOrganisationMembers()
  })

  // Fetch incident field values
  const fieldValuesQuery = useQuery({
    queryKey: ['incident-fieldvalues', id],
    queryFn: () => apiService.getIncidentFieldValues(incidentQuery.data!),
    enabled: () => incidentQuery.isSuccess
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

  const handleChangeSeverity = async (values: ChangeSeverityFormValues) => {
    await apiService.patchIncident(id, {
      incidentSeverity: {
        id: values.severity
      }
    })
    incidentQuery.refetch()
    incidentUpdatesQuery.refetch()
    closeModal()
  }

  const handleSetRole = async (values: RoleFormValues, role: IIncidentRole) => {
    try {
      await apiService.setUserRole(incidentQuery.data!, values.user, role)
      await incidentQuery.refetch()
      closeModal()
    } catch (e) {
      if (e instanceof APIError) {
        toast(e.detail, { type: 'error' })
      }
      console.error(e)
    }
  }

  const handleEditSeverity = (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault()
    if (!incidentQuery.data || !severitiesQuery.isSuccess) {
      return
    }
    setModal(
      <ModalContainer>
        <h2>Change severity</h2>
        <p>Change the severity of the incident below</p>
        <ChangeSeverityForm
          severityList={severitiesQuery.data.items}
          incident={incidentQuery.data}
          onSubmit={handleChangeSeverity}
        />
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

  const createShowAssignRoleFormHandler = (role: IIncidentRole) => {
    return async (evt: MouseEvent<HTMLButtonElement>) => {
      evt.preventDefault()
      if (!incidentQuery.data) {
        console.error('Incident has not been loaded yet')
        return
      }
      setModal(
        <ModalContainer>
          <h2>Assign role</h2>
          {usersQuery.isSuccess && incidentQuery.data ? (
            <RoleForm
              users={usersQuery.data.items.map((it) => it.user)}
              incident={incidentQuery.data}
              role={role}
              onSubmit={(values) => handleSetRole(values, role)}
            />
          ) : null}
        </ModalContainer>
      )
    }
  }

  const handleSetFieldValue = useCallback(
    async (field: IField, values: FieldFormValues) => {
      if (!incidentQuery.data) {
        console.error('Incident has not been fetched yet')
        return
      }
      try {
        const normalized = [
          {
            field: {
              id: field.id
            },
            value: values[field.id]
          }
        ]
        await apiService.patchIncidentFieldValues(incidentQuery.data, normalized)
        fieldValuesQuery.refetch()
        closeModal()
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.message, { type: 'error' })
        }
        console.error(e)
      }
    },
    [incidentQuery, apiService, closeModal, fieldValuesQuery]
  )

  const createShowEditCustomFieldHandler = useCallback(
    (field: IField, value: IIncidentFieldValue | null) => {
      return (evt?: MouseEvent<HTMLButtonElement>) => {
        evt?.preventDefault()
        if (!incidentQuery.data) {
          return
        }
        setModal(
          <ModalContainer>
            <h2>{field.label}</h2>
            <FieldForm
              onSubmit={(values) => handleSetFieldValue(field, values)}
              incident={incidentQuery.data}
              field={field}
              value={value}
            />
          </ModalContainer>
        )
      }
    },
    [setModal, incidentQuery.data, handleSetFieldValue]
  )

  const slackUrl = useMemo(
    () => `slack://channel?team=${organisation?.slackTeamId}&id=${incidentQuery.data?.slackChannelId}`,
    [organisation, incidentQuery.data?.slackChannelId]
  )

  return (
    <>
      {showShareUpdateModal && (
        <ShareUpdateModal
          onClose={() => setShowShareUpdateModal(false)}
          fieldValues={fieldValuesQuery.data?.items || []}
          incident={incidentQuery.data!}
        />
      )}
      {showUpdateIncidentStatusModal && (
        <UpdateIncidentStatusModal
          onClose={() => setShowUpdateIncidentStatusModal(false)}
          incident={incidentQuery.data!}
        />
      )}
      {showUpdateTimestampsModal && (
        <UpdateIncidentTimestampsModal
          incident={incidentQuery.data!}
          onClose={() => setShowUpdateTimestampsModal(false)}
        />
      )}
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
                <ContentHeader>
                  <h3>Summary</h3>
                </ContentHeader>
                <ContentSection>
                  <Description>
                    <EditDescriptionForm incident={incidentQuery.data} onSubmit={handleChangeDescription} />
                  </Description>
                </ContentSection>

                <ContentHeader>
                  <h3>Updates</h3>
                  <Button onClick={() => setShowShareUpdateModal(true)}>Share update</Button>
                </ContentHeader>
                <ContentSection>
                  {incidentUpdatesQuery.isSuccess ? (
                    <Timeline
                      updates={incidentUpdatesQuery.data.items}
                      render={(item) => <IncidentUpdate incidentUpdate={item} />}
                    />
                  ) : (
                    <p>There was an issue </p>
                  )}
                </ContentSection>
              </ContentMain>
              <ContentSidebar>
                <FieldsHeader>Properties</FieldsHeader>
                <RelatedFields>
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
                      <FlatButton type="button" onClick={() => setShowUpdateIncidentStatusModal(true)}>
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
                    <FieldValue>
                      <PaddedValue>{incidentQuery.data.incidentType.name}</PaddedValue>
                    </FieldValue>
                  </Field>
                </RelatedFields>

                <FieldsHeader>Roles</FieldsHeader>
                <RelatedFields>
                  {rolesQuery.data?.items.map((role) => {
                    const assignment = incidentQuery.data.incidentRoleAssignments.find(
                      (it) => it.incidentRole.id === role.id
                    )
                    return (
                      <Field key={role.id}>
                        <FieldName>{role.name}</FieldName>
                        <FieldValue>
                          {assignment ? (
                            <>
                              {assignment.incidentRole.kind === IncidentRoleKind.REPORTER ? (
                                <PaddedValue>
                                  <MiniAvatar user={assignment.user} /> {assignment.user.name}
                                </PaddedValue>
                              ) : (
                                <FlatButton type="button" onClick={createShowAssignRoleFormHandler(role)}>
                                  <InnerButtonContent>
                                    <MiniAvatar user={assignment.user} /> {assignment.user.name}
                                  </InnerButtonContent>
                                </FlatButton>
                              )}
                            </>
                          ) : (
                            <FlatButton type="button" onClick={createShowAssignRoleFormHandler(role)}>
                              Set role
                            </FlatButton>
                          )}
                        </FieldValue>
                      </Field>
                    )
                  })}
                </RelatedFields>

                <FieldsHeader>
                  <div>Timestamps</div>
                  <div>
                    <FlatButton type="button" onClick={() => setShowUpdateTimestampsModal(true)}>
                      <Icon icon={wrench} />
                    </FlatButton>
                  </div>
                </FieldsHeader>
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

                {fieldValuesQuery.isSuccess && fieldValuesQuery.data.total > 0 ? (
                  <>
                    <FieldsHeader>
                      <div>Custom fields</div>
                    </FieldsHeader>
                    <RelatedFields>
                      {fieldValuesQuery.data.items.map((row) => (
                        <Field key={row.field.id}>
                          <FieldName>{row.field.label}</FieldName>
                          <FieldValue>
                            {row.value ? (
                              <InnerButtonContent>
                                {row.value ? (
                                  <DisplayFieldValue
                                    field={row.field}
                                    incidentFieldValue={row.value}
                                    onClick={() => createShowEditCustomFieldHandler(row.field, row.value)()}
                                  />
                                ) : (
                                  'Set value'
                                )}
                              </InnerButtonContent>
                            ) : (
                              <FlatButton
                                type="button"
                                onClick={createShowEditCustomFieldHandler(row.field, row.value)}
                              >
                                <InnerButtonContent>Set value</InnerButtonContent>
                              </FlatButton>
                            )}
                          </FieldValue>
                        </Field>
                      ))}
                    </RelatedFields>
                  </>
                ) : null}
              </ContentSidebar>
            </Content>
          </>
        ) : null}
      </Box>
    </>
  )
}

export default ShowIncident
