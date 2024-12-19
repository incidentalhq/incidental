import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { IField, IIncident, IIncidentFieldValue } from '@/types/models'

import FieldForm, { FormValues } from '../components/Field/FieldForm'

interface Props {
  onClose: () => void
  incident: IIncident
  field: IField
  value: IIncidentFieldValue | null
}

const EditCustomFieldModal: React.FC<Props> = ({ onClose, incident, field, value }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const editFieldValueMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const normalized = [
        {
          field: {
            id: field.id
          },
          value: values[field.id]
        }
      ]
      return apiService.patchIncidentFieldValues(incident, normalized)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['incident-fieldvalues', incident.id]
      })
      onClose()
    }
  })

  const handleSetFieldValue = useCallback(
    async (values: FormValues) => {
      try {
        await editFieldValueMutation.mutateAsync(values)
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.message, { type: 'error' })
        }
        console.error(e)
      }
    },
    [editFieldValueMutation]
  )

  return (
    <Dialog onClose={onClose} title={`Edit ${field.label}`} size="sm">
      <FieldForm onSubmit={handleSetFieldValue} incident={incident} field={field} value={value} />
    </Dialog>
  )
}

export default EditCustomFieldModal
