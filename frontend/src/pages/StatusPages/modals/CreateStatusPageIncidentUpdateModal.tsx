import { useMutation, useQueryClient } from '@tanstack/react-query'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { CreateStatusPageIncidentUpdate } from '@/types/action'
import { IStatusPage, IStatusPageIncident } from '@/types/models'

import CreateStatusPageIncidentUpdateForm, { FormValues } from '../components/CreateStatusPageIncidentUpdateForm'

interface Props {
  statusPage: IStatusPage
  statusPageIncident: IStatusPageIncident
  onClose: () => void
}

const CreateStatusPageIncidentUpdateModal: React.FC<Props> = ({ onClose, statusPageIncident, statusPage }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (value: CreateStatusPageIncidentUpdate) =>
      apiService.createStatusPageIncidentUpdate(statusPageIncident.id, value),
    onSuccess: () => {
      onClose()
      queryClient.invalidateQueries({ queryKey: ['get-status-page-incident', statusPageIncident.id] })
    }
  })

  const handleSubmit = (values: FormValues) => {
    mutation.mutateAsync({
      ...values
    })
  }

  return (
    <Dialog onClose={onClose} title="Share new update">
      <CreateStatusPageIncidentUpdateForm
        onSubmit={handleSubmit}
        statusPage={statusPage}
        statusPageIncident={statusPageIncident}
      />
    </Dialog>
  )
}

export default CreateStatusPageIncidentUpdateModal
