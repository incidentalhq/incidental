import { useMutation, useQueryClient } from '@tanstack/react-query'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { IStatusPage } from '@/types/models'

import GroupForm, { FormValues } from '../components/GroupForm'

interface Props {
  onClose: () => void
  statusPage: IStatusPage
}

const CreateStatusPageGroupModal: React.FC<Props> = ({ onClose, statusPage }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (value: FormValues) => apiService.createStatusPageGroup(statusPage.id, value),
    onSuccess: () => {
      onClose()
      queryClient.invalidateQueries({ queryKey: ['get-status-page', statusPage.id] })
    }
  })

  const handleSubmit = (values: FormValues) => {
    mutation.mutateAsync({
      ...values
    })
  }

  return (
    <Dialog onClose={onClose} title="Create group">
      <GroupForm onSubmit={handleSubmit} />
    </Dialog>
  )
}

export default CreateStatusPageGroupModal
