import { useMutation, useQueryClient } from '@tanstack/react-query'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { IStatusPage } from '@/types/models'

import ComponentForm, { FormValues } from '../components/ComponentForm'

interface Props {
  onClose: () => void
  statusPage: IStatusPage
}

const CreateComponentModal: React.FC<Props> = ({ onClose, statusPage }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (value: FormValues) => apiService.createStatusPageComponent(statusPage.id, value),
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
    <Dialog onClose={onClose} title="Create component">
      <ComponentForm onSubmit={handleSubmit} />
    </Dialog>
  )
}

export default CreateComponentModal
