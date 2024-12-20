import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormikHelpers } from 'formik'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { IField, IIncidentType } from '@/types/models'
import { apiErrorsToFormikErrors } from '@/utils/form'

import IncidentTypeForm, { FormValues } from '../components/IncidentType/IncidentTypeForm'

interface Props {
  onClose: () => void
  fields: IField[]
  incidentType: IIncidentType
}

const UpdateIncidentTypeModal: React.FC<Props> = ({ onClose, fields, incidentType }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const patchIncidentTypeMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const normalized = {
        ...values,
        fields: values.fields.map((it) => ({
          id: it.value
        }))
      }
      return apiService.patchIncidentType(incidentType, normalized)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['types']
      })
      onClose()
      toast('Incident type updated', { type: 'success' })
    }
  })

  const handlePatch = useCallback(
    async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
      try {
        await patchIncidentTypeMutation.mutateAsync(values)
      } catch (e) {
        if (e instanceof APIError) {
          helpers.setErrors(apiErrorsToFormikErrors(e))
        }
        console.error(e)
      }
    },
    [patchIncidentTypeMutation]
  )

  return (
    <Dialog onClose={onClose} title="Edit incident type" size="sm">
      <IncidentTypeForm
        fields={fields}
        incidentType={incidentType}
        onSubmit={(values, helpers) => handlePatch(values, helpers)}
      />
    </Dialog>
  )
}

export default UpdateIncidentTypeModal
