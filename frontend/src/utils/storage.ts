const AUTH_KEY = 'auth_token'
const OAUTH_REQUESTS_KEY = 'pending_oauth_requests'

export const saveAuthToBrowser = (data: any) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data))
}

export const getAuthFromBrowser = () => {
  const data = localStorage.getItem(AUTH_KEY)
  if (data !== null) {
    return JSON.parse(data)
  }
  return null
}

export const clearUserDataFromBrowser = () => {
  localStorage.removeItem(AUTH_KEY)
}

interface LocalOAuthRequest {
  code: string
  state: string
}

export const pushOAuthRequest = (code: string, state: string) => {
  const currentRequests = localStorage.getItem(OAUTH_REQUESTS_KEY)
  let requests: LocalOAuthRequest[] = []

  if (currentRequests !== null) {
    requests = JSON.parse(currentRequests)
  } else {
    requests = []
  }

  requests.push({
    code,
    state
  })

  localStorage.setItem(OAUTH_REQUESTS_KEY, JSON.stringify(requests))
}

export const popOAuthRequest = () => {
  const currentRequests = localStorage.getItem(OAUTH_REQUESTS_KEY)
  if (!currentRequests) {
    return null
  }

  const requests: LocalOAuthRequest[] = JSON.parse(currentRequests)

  if (requests.length == 0) {
    return null
  }

  const firstRequest = requests.pop() as LocalOAuthRequest
  return firstRequest
}

export const removeOAuthRequest = (code: string) => {
  const currentRequests = localStorage.getItem(OAUTH_REQUESTS_KEY)
  if (!currentRequests) {
    return
  }

  const requests: LocalOAuthRequest[] = JSON.parse(currentRequests)

  if (requests.length == 0) {
    return
  }

  const filteredRequests = requests.filter((it) => it.code !== code)

  localStorage.setItem(OAUTH_REQUESTS_KEY, JSON.stringify(filteredRequests))
}
