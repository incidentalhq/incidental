import { useMutation, useQueryClient } from '@tanstack/react-query'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { CreateStatusPageIncident } from '@/types/action'
import { IStatusPage, ModelID } from '@/types/models'

import CreateStatusPageIncidentForm, { FormValues } from './components/CreateStatusPageIncidentForm'

interface Props {
  statusPage: IStatusPage
  onClose: () => void
}

const CreateIncidentModal: React.FC<Props> = ({ onClose, statusPage }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ value, id }: { value: CreateStatusPageIncident; id: ModelID }) =>
      apiService.createStatusPageIncident(id, value),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-active-status-page-incidents', statusPage.id]
      })
      onClose()
    }
  })

  const handleSubmit = (values: FormValues) => {
    mutation.mutateAsync({
      id: statusPage.id,
      value: values
    })
  }

  return (
    <Dialog onClose={onClose} title="Create new status page incident">
      <CreateStatusPageIncidentForm statusPage={statusPage} onSubmit={handleSubmit} />
    </Dialog>
  )
}

export default CreateIncidentModal
