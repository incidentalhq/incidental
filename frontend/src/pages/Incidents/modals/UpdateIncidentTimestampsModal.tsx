import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { IIncident } from '@/types/models'
import { getLocalTimeZone } from '@/utils/time'

import EditTimestampsForm, { FormValues } from '../components/Timestamps/EditTimestampsForm'

interface Props {
  onClose: () => void
  incident: IIncident
}

const UpdateIncidentTimestampsModal: React.FC<Props> = ({ onClose, incident }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const updateTimestampValuesMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const normalizedValues = Object.keys(values).reduce(
        (prev, key) => {
          const value = values[key as keyof FormValues]
          if (value === '') {
            prev[key] = null
          } else {
            prev[key] = value
          }
          return prev
        },
        {} as Record<string, string | null>
      )
      return apiService.patchTimestampValues(incident, normalizedValues, getLocalTimeZone())
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['incident', incident.id]
      })
      queryClient.invalidateQueries({
        queryKey: ['incident-updates', incident.id]
      })
      onClose()
    }
  })

  const handleUpdateTimestampValues = useCallback(
    async (values: FormValues) => {
      try {
        await updateTimestampValuesMutation.mutateAsync(values)
        toast('Timestamps updated', { type: 'success' })
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.detail, { type: 'error' })
        } else {
          toast('There was a problem updating timestamps', { type: 'error' })
        }
      }
    },
    [updateTimestampValuesMutation]
  )

  return (
    <Dialog onClose={onClose} title="Update incident timestamps" size="sm">
      <EditTimestampsForm incident={incident} onSubmit={handleUpdateTimestampValues} />
    </Dialog>
  )
}

export default UpdateIncidentTimestampsModal
