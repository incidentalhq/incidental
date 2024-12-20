import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { IIncident } from '@/types/models'

import ChangeStatusForm, { FormValues } from '../components/ChangeStatusForm/ChangeStatusForm'

interface Props {
  onClose: () => void
  incident: IIncident
}

const UpdateIncidentStatusModal: React.FC<Props> = ({ onClose, incident }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const editStatusMutation = useMutation({
    mutationFn: (values: FormValues) =>
      apiService.patchIncident(incident.id, {
        incidentStatus: {
          id: values.status
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['incident-updates', incident.id]
      })
      queryClient.invalidateQueries({
        queryKey: ['incidents', incident.id]
      })
      onClose()
    }
  })

  const handleChangeStatus = useCallback(
    async (values: FormValues) => {
      try {
        await editStatusMutation.mutateAsync(values)
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.detail, { type: 'error' })
        }
        console.error(e)
      }
    },
    [editStatusMutation]
  )

  return (
    <Dialog onClose={onClose} title="Update incident status" size="sm">
      <ChangeStatusForm incident={incident} onSubmit={handleChangeStatus} />
    </Dialog>
  )
}

export default UpdateIncidentStatusModal
