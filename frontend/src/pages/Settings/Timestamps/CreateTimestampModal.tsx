import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'

import TimestampForm, { FormValues } from '../components/TimestampForm'

interface Props {
  onClose: () => void
}

const CreateTimestampModal: React.FC<Props> = ({ onClose }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const createTimestampMutation = useMutation({
    mutationFn: (values: FormValues) => apiService.createTimestamp(values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['timestamps']
      })
      toast('New timestamp added', { type: 'success' })
      onClose()
    }
  })

  const handleAddTimestamp = useCallback(
    async (values: FormValues) => {
      try {
        await createTimestampMutation.mutateAsync(values)
      } catch (e) {
        let message = 'There was an error adding the timestamp'
        if (e instanceof APIError) {
          message = e.detail
        }
        toast(message, { type: 'error' })
      }
    },
    [createTimestampMutation]
  )

  return (
    <Dialog onClose={onClose} title="Create new custom timestamp" size="sm">
      <TimestampForm onSubmit={handleAddTimestamp} />
    </Dialog>
  )
}

export default CreateTimestampModal
