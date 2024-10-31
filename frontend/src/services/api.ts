import { PaginatedResults } from '@/types/core'
import { IncidentStatusCategory } from '@/types/enums'
import {
  IField,
  IForm,
  IFormField,
  IIncident,
  IIncidentRole,
  IIncidentSeverity,
  IIncidentStatus,
  IIncidentType,
  IIncidentUpdate,
  ILifecycle,
  ILoggedInUser,
  IOrganisation,
  IOrganisationMember,
  IPublicUser,
  ISettings,
  IStatusPage,
  ITimestamp,
  IUser,
  IWorld,
  ModelID
} from '@/types/models'
import { ICombinedFieldAndValue } from '@/types/special'
import { DeepPartial } from '@/types/utils'

import { callApi } from './transport'

const ORGANISATION_HEADER_KEY = 'x-organisation-id'

interface ICreateUser {
  name: string
  emailAddress: string
  password: string
}

interface IAuthUser {
  emailAddress: string
  password: string
}

type SearchIncidentsParams = {
  query?: string
  statusCategory?: IncidentStatusCategory[]
  page?: number
  size?: number
}

export class ApiService {
  user: ILoggedInUser | undefined
  organisation: string

  constructor() {
    this.organisation = ''
  }

  setCurrentUser(user: ILoggedInUser | undefined) {
    this.user = user
  }

  setOrganisation(organisation: ModelID) {
    this.organisation = organisation
  }

  createUser(userData: ICreateUser) {
    return callApi<IPublicUser>('POST', '/users', { json: userData })
  }

  authUser(userData: IAuthUser) {
    return callApi<ILoggedInUser>('POST', '/users/auth', {
      json: userData
    })
  }

  getMe() {
    return callApi<ILoggedInUser>('GET', '/users/me', {
      user: this.user
    })
  }

  updateUser(data: Record<string, unknown>) {
    return callApi<IUser>('PUT', '/users', { user: this.user, json: data })
  }

  getWorld() {
    return callApi<IWorld>('GET', '/world', { user: this.user })
  }

  slackCompleteLogin(code: string) {
    return callApi<ILoggedInUser>('POST', '/slack/openid/complete', {
      json: { code }
    })
  }

  slackCompleteAppInstallation(code: string) {
    return callApi<IOrganisation>('POST', '/slack/oauth/complete', {
      user: this.user,
      json: { code }
    })
  }

  searchIncidents({ query, statusCategory, page = 1, size = 25 }: SearchIncidentsParams) {
    return callApi<PaginatedResults<IIncident>>('GET', `/incidents/search`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      },
      params: {
        q: query,
        page,
        size,
        statusCategory
      }
    })
  }

  getIncident(id: string) {
    return callApi<IIncident>('GET', `/incidents/${id}`, { user: this.user })
  }

  getIncidentUpdates(id: string) {
    return callApi<PaginatedResults<IIncidentUpdate>>('GET', `/incidents/${id}/updates`, { user: this.user })
  }

  patchIncident(id: string, patch: DeepPartial<IIncident>) {
    return callApi<IIncident>('PATCH', `/incidents/${id}`, { user: this.user, json: patch })
  }

  createIncident(values: Record<string, string>) {
    return callApi<IIncident>('POST', `/incidents`, {
      user: this.user,
      json: values,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  slackLoginUrl() {
    return callApi<{ url: string }>('GET', `/slack/openid/login`)
  }

  slackAppInstallationUrl() {
    return callApi<{ url: string }>('GET', `/slack/oauth/install`, { user: this.user })
  }

  createSeverity(values: Omit<IIncidentSeverity, 'id' | 'rating' | 'createdAt'>) {
    return callApi<IIncidentSeverity>('POST', `/severities`, {
      user: this.user,
      json: values,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  patchSeverity(severity: IIncidentSeverity, values: Partial<Omit<IIncidentSeverity, 'id'>>) {
    return callApi<IIncidentSeverity>('PATCH', `/severities/${severity.id}`, {
      user: this.user,
      json: values
    })
  }

  deleteSeverity(severity: IIncidentSeverity) {
    return callApi<IIncidentSeverity>('DELETE', `/severities/${severity.id}`, {
      user: this.user
    })
  }

  getTimestamps() {
    return callApi<PaginatedResults<ITimestamp>>('GET', `/timestamps/search`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  createTimestamp(timestamp: Pick<ITimestamp, 'label' | 'description'>) {
    return callApi<ITimestamp>('POST', `/timestamps`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      },
      json: timestamp
    })
  }

  deleteTimestamp(timestamp: ITimestamp) {
    return callApi<ITimestamp>('DELETE', `/timestamps/${timestamp.id}`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  patchTimestampValues = (incident: IIncident, timestampsValues: Record<ModelID, string | null>, timezone: string) => {
    return callApi('PATCH', `/incidents/${incident.id}/timestamps`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      },
      json: {
        values: timestampsValues,
        timezone: timezone
      }
    })
  }

  getSettings = (organisation: IOrganisation) => {
    return callApi<ISettings>('GET', `/organisations/${organisation.id}/settings`, {
      user: this.user
    })
  }

  updateSettings = (organisation: IOrganisation, values: Partial<ISettings>) => {
    return callApi<ISettings>('PATCH', `/organisations/${organisation.id}/settings`, {
      user: this.user,
      json: values
    })
  }

  getRoles = () => {
    return callApi<PaginatedResults<IIncidentRole>>('GET', `/roles/search`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  getOrganisationMembers = () => {
    return callApi<PaginatedResults<IOrganisationMember>>('GET', `/users/search`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  setUserRole = (incident: IIncident, user: IPublicUser | null, role: IIncidentRole) => {
    return callApi('PUT', `/incidents/${incident.id}/roles`, {
      user: this.user,
      json: {
        user: user ? { id: user.id } : null,
        role: { id: role.id }
      }
    })
  }

  updateRole = (role: IIncidentRole, values: Partial<IIncidentRole>) => {
    return callApi('PUT', `/roles/${role.id}`, {
      user: this.user,
      json: values
    })
  }

  createRole = (values: Partial<IIncidentRole>) => {
    return callApi('POST', `/roles`, {
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      },
      user: this.user,
      json: values
    })
  }

  deleteRole = (role: IIncidentRole) => {
    return callApi('DELETE', `/roles/${role.id}`, {
      user: this.user
    })
  }

  getFields = () => {
    return callApi<PaginatedResults<IField>>('GET', `/fields/search`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  createField = (values: unknown) => {
    return callApi<IField>('POST', `/fields`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      },
      json: values
    })
  }

  patchField = (field: IField, values: unknown) => {
    return callApi<IField>('PATCH', `/fields/${field.id}`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      },
      json: values
    })
  }

  deleteField = (field: IField) => {
    return callApi('DELETE', `/fields/${field.id}`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  getIncidentTypes = () => {
    return callApi<PaginatedResults<IIncidentType>>('GET', '/incident-types/search', {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  patchIncidentType = (type: IIncidentType, values: unknown) => {
    return callApi<IIncidentType>('PATCH', `/incident-types/${type.id}`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      },
      json: values
    })
  }

  createIncidentType = (values: unknown) => {
    return callApi<IIncidentType>('POST', `/incident-types`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      },
      json: values
    })
  }

  deleteIncidentType = (type: IIncidentType) => {
    return callApi<IIncidentType>('DELETE', `/incident-types/${type.id}`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  getIncidentFieldValues = (incident: IIncident) => {
    return callApi<PaginatedResults<ICombinedFieldAndValue>>('GET', `/incidents/${incident.id}/field-values`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  patchIncidentFieldValues = (incident: IIncident, values: unknown) => {
    return callApi('PATCH', `/incidents/${incident.id}/field-values`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      },
      json: values
    })
  }

  getForm = (id: string) => {
    return callApi<IForm>('GET', `/forms/${id}`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  getForms = () => {
    return callApi<PaginatedResults<IForm>>('GET', `/forms/search`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  getIncidentStatuses = () => {
    return callApi<PaginatedResults<IIncidentStatus>>('GET', `/statuses/search`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  getLifecycle = () => {
    return callApi<ILifecycle>('GET', `/lifecycle`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  patchLifecycle = (lifecycle: ILifecycle, values: Partial<ILifecycle>) => {
    return callApi<ILifecycle>('PATCH', `/lifecycle/${lifecycle.id}`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      },
      json: values
    })
  }

  getFormFields = (form: IForm) => {
    return callApi<PaginatedResults<IFormField>>('GET', `/forms/${form.id}/fields`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  getIncidentSeverities = () => {
    return callApi<PaginatedResults<IIncidentSeverity>>('GET', `/severities/search`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  verifyAccount = (email: string, code: string) =>
    callApi('POST', `/users/verify`, {
      json: { emailAddress: email, code }
    })

  sendVerificationCode = (email: string) =>
    callApi('POST', `/users/send-verification`, {
      json: { emailAddress: email }
    })

  patchFormFieldValues = (formId: string, patchList: Array<Partial<IFormField>>) =>
    callApi('PATCH', `/forms/${formId}/fields`, {
      user: this.user,
      json: patchList
    })

  patchFormField = (id: ModelID, patchIn: Partial<IFormField>) =>
    callApi<IFormField>('PATCH', `/forms/fields/${id}`, {
      user: this.user,
      json: patchIn
    })

  createFormField = (id: string, createIn: { field: { id: string } }) =>
    callApi<IFormField>('POST', `/forms/${id}/fields`, {
      user: this.user,
      json: createIn
    })

  deleteFormField = (id: string) =>
    callApi('DELETE', `/forms/fields/${id}`, {
      user: this.user
    })

  createIncidentUpdate = (incidentId: ModelID, values: Record<string, unknown>) =>
    callApi('POST', `/incidents/${incidentId}/updates`, {
      user: this.user,
      json: values
    })

  searchStatusPages = () =>
    callApi<PaginatedResults<IStatusPage>>('GET', `/status-pages/search`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
}
