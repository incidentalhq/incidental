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
    set(formErrors, field.loc, field.msg)
  }
  return formErrors
}
