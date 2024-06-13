import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

export const getLocalTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export const utcToLocal = (date: string) => {
  return toZonedTime(date, getLocalTimeZone())
}

export const formatForDateTimeInput = (isoDateTime: string) => {
  const localDate = utcToLocal(isoDateTime)
  return format(localDate, "yyyy-MM-dd'T'HH:mm")
}
