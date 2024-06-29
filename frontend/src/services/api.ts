import { PaginatedResults } from '@/types/core'
import { IncidentStatusCategory } from '@/types/enums'
import {
  IIncident,
  IIncidentRole,
  IIncidentSeverity,
  IIncidentUpdate,
  ILoggedInUser,
  IOrganisation,
  IPublicUser,
  ISettings,
  ITimestamp,
  IUser,
  IWorld,
  ModelID
} from '@/types/models'
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

  getUsers = () => {
    return callApi<PaginatedResults<IPublicUser>>('GET', `/users/search`, {
      user: this.user,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  setUserRole = (incident: IIncident, user: IPublicUser, role: IIncidentRole) => {
    return callApi('PUT', `/incidents/${incident.id}/roles`, {
      user: this.user,
      json: {
        user: { id: user.id },
        role: { id: role.id }
      }
    })
  }
}
