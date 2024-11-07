import { useMutation, useQueryClient } from '@tanstack/react-query'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { IStatusPage } from '@/types/models'

import ComponentForm, { FormValues } from './components/ComponentForm'

import { ComponentValue } from './types'

interface Props {
  onClose: () => void
  component: ComponentValue
  statusPage: IStatusPage
}

const EditComponentModal: React.FC<Props> = ({ onClose, component, statusPage }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (value: FormValues) => apiService.editStatusPageComponent(statusPage.id, component.id, value),
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
    <Dialog onClose={onClose} title="Edit component">
      <ComponentForm onSubmit={handleSubmit} component={component} />
    </Dialog>
  )
}

export default EditComponentModal
