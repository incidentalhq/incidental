import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormikHelpers } from 'formik'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { IField } from '@/types/models'
import { apiErrorsToFormikErrors } from '@/utils/form'

import AddFormFieldForm, { FormValues } from './components/AddFormFieldForm'

interface Props {
  onClose: () => void
  onSuccess?: () => void
  formId: string
  availableFields: IField[]
}

const AddFormFieldModal: React.FC<Props> = ({ onClose, formId, availableFields, onSuccess }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const createFormFieldMutation = useMutation({
    mutationFn: (value: FormValues) => apiService.createFormField(formId, value),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['form-fields']
      })
      toast('Field added to form', { type: 'success' })
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    }
  })

  const handleCreateFieldForm = useCallback(
    async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
      try {
        await createFormFieldMutation.mutateAsync(values)
      } catch (e) {
        if (e instanceof APIError) {
          helpers.setErrors(apiErrorsToFormikErrors(e))
          toast(e.message, { type: 'error' })
        }
        console.error(e)
      }
    },
    [createFormFieldMutation]
  )

  return (
    <Dialog onClose={onClose} title="Add a new field to this form" size="sm">
      <p>Use the dropdown to add a new field</p>
      <AddFormFieldForm onSubmit={handleCreateFieldForm} fields={availableFields} />
    </Dialog>
  )
}

export default AddFormFieldModal
