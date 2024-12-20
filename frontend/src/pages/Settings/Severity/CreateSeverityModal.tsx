import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'

import SeverityForm, { FormValues } from '../components/SeverityForm'

interface Props {
  onClose: () => void
}

const CreateSeverityModal: React.FC<Props> = ({ onClose }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const createSeverityMutation = useMutation({
    mutationFn: (values: FormValues) => apiService.createSeverity(values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['severities']
      })
      onClose()
      toast('Severity created', { type: 'success' })
    }
  })

  const handleCreateSeverity = useCallback(
    async (values: FormValues) => {
      try {
        await createSeverityMutation.mutateAsync(values)
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.detail, { type: 'error' })
        }
        console.error(e)
      }
    },
    [createSeverityMutation]
  )

  return (
    <Dialog onClose={onClose} title="Create severity" size="sm">
      <SeverityForm onSubmit={handleCreateSeverity} />
    </Dialog>
  )
}

export default CreateSeverityModal
