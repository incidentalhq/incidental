import set from 'lodash/set'

import { APIError } from '@/services/transport'

export const apiErrorsToFormikErrors = (e: APIError) => {
  const formErrors: Record<string, unknown> = {}

  if (!e.errors) {
    formErrors['general'] = e.detail
    return formErrors
  }

  // A more detailed validation error from pydantic
  for (const field of e.errors) {
    let location = []
    if (field.loc[0] == 'body') {
      location = field.loc.slice(1)
    } else {
      location = field.loc
    }
    set(formErrors, location, field.msg)
  }
  return formErrors
}
