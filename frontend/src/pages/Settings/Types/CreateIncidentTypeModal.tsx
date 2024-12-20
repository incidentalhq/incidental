import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { IField } from '@/types/models'

import IncidentTypeForm, { FormValues } from '../components/IncidentType/IncidentTypeForm'

interface Props {
  onClose: () => void
  fields: IField[]
}

const CreateIncidentTypeModal: React.FC<Props> = ({ onClose, fields }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const createIncidentTypeMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const normalized = {
        ...values,
        fields: values.fields.map((it) => ({
          id: it.value
        }))
      }
      return apiService.createIncidentType(normalized)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['types']
      })
      onClose()
      toast('Incident type created', { type: 'success' })
    }
  })

  const handleCreate = useCallback(
    async (values: FormValues) => {
      try {
        await createIncidentTypeMutation.mutateAsync(values)
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.detail, { type: 'error' })
        }
        console.error(e)
      }
    },
    [createIncidentTypeMutation]
  )

  return (
    <Dialog onClose={onClose} title="Create new incident type" size="sm">
      <IncidentTypeForm fields={fields} onSubmit={handleCreate} />
    </Dialog>
  )
}

export default CreateIncidentTypeModal
