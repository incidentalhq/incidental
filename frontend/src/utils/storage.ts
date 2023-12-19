const AUTH_KEY = 'auth_token'
const PREFERENCE_PREFIX = 'preference'

// local preference keys
export const PREF_SELECTED_ORGANISATION = 'SELECTED_ORGANISATION'

export const saveAuthToBrowser = (data: unknown) => {
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

export const setPreference = (name: string, value: unknown) => {
  const key = `${PREFERENCE_PREFIX}:${name}`
  localStorage.setItem(key, JSON.stringify(value))
}

export const getPreference = <T>(name: string): T | null => {
  const key = `${PREFERENCE_PREFIX}:${name}`
  const value = localStorage.getItem(key)
  if (value === null) {
    return null
  }
  return JSON.parse(value)
}
