import qs from 'qs'

import { IErrorItem, IResponseError } from '@/types/core'
import { IUser } from '@/types/models'

export const getBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  if (!baseUrl) {
    throw new Error('API_BASE_URL not defined')
  }
  return baseUrl
}

export const createAuthHeader = (authToken: string) => ({
  Authorization: `Bearer ${authToken}`
})

export class APIError extends Error {
  errors?: IErrorItem[]
  detail: string
  statusCode: number
  code: string
  constructor(statusCode: number, detail: string, code: string, errors?: IErrorItem[]) {
    super(detail)
    this.detail = detail
    this.errors = errors
    this.statusCode = statusCode
    this.code = code
  }
}

interface APICallConfig {
  user?: Required<Pick<IUser, 'authToken'>>
  headers?: Record<string, string>
  json?: unknown
  params?: Record<string, unknown>
}
type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'

export const callApi = async <T>(method: Method = 'GET', url: string, config?: APICallConfig): Promise<T> => {
  const fetchConfig: RequestInit = {
    method
  }
  let urlQs = ''

  // build headers
  const headers = new Headers()
  if (config?.user) {
    headers.set('Authorization', `Bearer ${config.user.authToken}`)
  }

  // add custom headers
  if (config?.headers) {
    const headerKeys = Object.keys(config.headers)
    for (const headerKey of headerKeys) {
      headers.set(headerKey, config.headers[headerKey])
    }
  }
  // data field is assumed to be json
  if (config?.json) {
    fetchConfig.body = JSON.stringify(config.json)
    headers.set('Content-type', 'application/json')
  }
  // add url parameters
  if (config?.params) {
    urlQs = '?' + qs.stringify(config.params, { arrayFormat: 'repeat' })
  }

  fetchConfig.headers = headers

  try {
    const response = await fetch(`${getBaseUrl()}${url}${urlQs}`, fetchConfig)
    const data = await response.json()

    if (!response.ok) {
      const applicationError = data as IResponseError
      if (applicationError.detail || applicationError.errors) {
        throw new APIError(response.status, applicationError.detail, applicationError.code, applicationError.errors)
      }
      throw new APIError(response.status, data.message || 'Unknown error', 'generic_error')
    }

    return data as T
  } catch (error) {
    // Unknown
    throw new APIError(500, 'There was an unknown problem contacting the server', 'generic_error')
  }
}
