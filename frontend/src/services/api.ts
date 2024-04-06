import { PaginatedResults } from '@/types/core'
import { IncidentStatusCategory } from '@/types/enums'
import {
  IIncident,
  IIncidentSeverity,
  IIncidentUpdate,
  ILoggedInUser,
  IOrganisation,
  IPublicUser,
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
  organisation: string | undefined

  setCurrentUser(user: ILoggedInUser) {
    this.user = user
  }

  setOrganisation(organisation: ModelID) {
    this.organisation = organisation
  }

  createUser(userData: ICreateUser) {
    return callApi<IPublicUser>('POST', '/users', { data: userData })
  }

  authUser(userData: IAuthUser) {
    return callApi<ILoggedInUser>('POST', '/users/auth', {
      data: userData
    })
  }

  updateUser(data: Record<string, unknown>) {
    return callApi<IUser>('PUT', '/users', { user: this.user, data })
  }

  getWorld() {
    return callApi<IWorld>('GET', '/world', { user: this.user })
  }

  slackCompleteLogin(code: string) {
    return callApi<ILoggedInUser>('POST', '/slack/openid/complete', {
      data: { code }
    })
  }

  slackCompleteAppInstallation(code: string) {
    return callApi<IOrganisation>('POST', '/slack/oauth/complete', {
      user: this.user,
      data: { code }
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
    return callApi<IIncident>('PATCH', `/incidents/${id}`, { user: this.user, data: patch })
  }

  createIncident(values: Record<string, string>) {
    return callApi<IIncident>('POST', `/incidents`, {
      user: this.user,
      data: values,
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
      data: values,
      headers: {
        [ORGANISATION_HEADER_KEY]: this.organisation
      }
    })
  }

  patchSeverity(severity: IIncidentSeverity, values: Partial<Omit<IIncidentSeverity, 'id'>>) {
    return callApi<IIncidentSeverity>('PATCH', `/severities/${severity.id}`, {
      user: this.user,
      data: values
    })
  }

  deleteSeverity(severity: IIncidentSeverity) {
    return callApi<IIncidentSeverity>('DELETE', `/severities/${severity.id}`, {
      user: this.user
    })
  }
}
