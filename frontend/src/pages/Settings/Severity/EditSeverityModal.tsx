import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { IIncidentSeverity } from '@/types/models'

import SeverityForm, { FormValues } from '../components/SeverityForm'

interface Props {
  onClose: () => void
  severity: IIncidentSeverity
}

const EditSeverityModal: React.FC<Props> = ({ onClose, severity }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const patchSeverityMutation = useMutation({
    mutationFn: (values: FormValues) => apiService.patchSeverity(severity, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['severities']
      })
      onClose()
      toast('Severity updated', { type: 'success' })
    }
  })

  const handlePatchSeverity = useCallback(
    async (values: FormValues) => {
      try {
        await patchSeverityMutation.mutateAsync(values)
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.detail, { type: 'error' })
        }
        console.error(e)
      }
    },
    [patchSeverityMutation]
  )

  return (
    <Dialog onClose={onClose} title="Edit severity" size="sm">
      <SeverityForm severity={severity} onSubmit={handlePatchSeverity} />
    </Dialog>
  )
}

export default EditSeverityModal
