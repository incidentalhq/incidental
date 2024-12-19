import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import DeclareIncidentForm, { FormValues } from '@/components/Incident/DeclareIncidentForm'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { FormType } from '@/types/enums'

interface Props {
  onClose: () => void
}

const DeclareIncidentModal: React.FC<Props> = ({ onClose }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()
  const { forms } = useGlobal()

  const createForm = useMemo(() => forms.find((it) => it.type == FormType.CREATE_INCIDENT), [forms])

  const createIncidentMutation = useMutation({
    mutationFn: (values: FormValues) => apiService.createIncident(values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['incident-list']
      })
      toast('Incident declared', { type: 'success' })
      onClose()
    }
  })

  const handleCreateIncident = useCallback(
    async (values: FormValues) => {
      createIncidentMutation.mutateAsync(values)
    },
    [createIncidentMutation]
  )

  return (
    <Dialog onClose={onClose} title="Create new incident" size="lg">
      <DeclareIncidentForm onSubmit={handleCreateIncident} form={createForm!} />
    </Dialog>
  )
}

export default DeclareIncidentModal
