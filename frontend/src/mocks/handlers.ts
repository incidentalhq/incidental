import { http, HttpResponse } from 'msw'

import { getBaseUrl } from '@/services/transport'
import { PaginatedResults } from '@/types/core'

// mock api responses
import mockIncidentsSearch from './api/incidents_search.json'

const baseUrl = getBaseUrl()

const createPaginatedResults = <T>(): PaginatedResults<T> => {
  return {
    total: 0,
    size: 0,
    items: [],
    page: 1
  }
}

export const handlers = [
  http.get(`${baseUrl}/incidents/search`, ({ request }) => {
    const url = new URL(request.url)
    const statusCategory = url.searchParams.get('statusCategory')
    // return empty for triage
    const results = statusCategory === 'ACTIVE' ? mockIncidentsSearch : createPaginatedResults()

    return HttpResponse.json(results)
  }),

  http.get(`${baseUrl}/slack/openid/login`, () => {
    // todo: should return the right response
    return HttpResponse.json({})
  })
]
