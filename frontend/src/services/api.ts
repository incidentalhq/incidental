import { PaginatedResults } from '@/types/core'
import { IIncident, IIncidentUpdate, ILoggedInUser, IPublicUser, IUser, IWorld } from '@/types/models'

import { callApi } from './transport'

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
  statusCategory?: string[]
  page?: number
  size?: number
}

export class ApiService {
  user: ILoggedInUser | undefined
  organisation: string | undefined

  setCurrentUser(user: ILoggedInUser) {
    this.user = user
  }

  setOrganisation(organisation: string) {
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
    return callApi<IWorld>('GET', '/world/', { user: this.user })
  }

  slackOpenIdLogin(code: string) {
    return callApi<ILoggedInUser>('POST', '/slack/openid/complete', {
      data: { code }
    })
  }

  slackInstallation(code: string) {
    return callApi<ILoggedInUser>('POST', '/slack/oauth/complete', {
      data: { code }
    })
  }

  searchIncidents({ query, statusCategory, page = 1, size = 25 }: SearchIncidentsParams) {
    return callApi<PaginatedResults<IIncident>>('GET', `/incidents/search`, {
      user: this.user,
      headers: {
        'x-organisation-id': this.organisation
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
}
