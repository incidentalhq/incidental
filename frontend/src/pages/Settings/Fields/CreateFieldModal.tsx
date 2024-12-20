import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormikHelpers } from 'formik'
import { useCallback } from 'react'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { IField } from '@/types/models'
import { apiErrorsToFormikErrors } from '@/utils/form'

import FieldForm, { FormValues } from '../components/Field/FieldForm'

interface Props {
  onClose: () => void
}

const CreateFieldModal: React.FC<Props> = ({ onClose }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const createFieldMutation = useMutation({
    mutationFn: (values: Partial<IField>) => apiService.createField(values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['fields']
      })
      onClose()
    }
  })

  const handleCreate = useCallback(
    async (values: Partial<IField>, helpers: FormikHelpers<FormValues>) => {
      try {
        await createFieldMutation.mutateAsync(values)
      } catch (e) {
        if (e instanceof APIError) {
          helpers.setErrors(apiErrorsToFormikErrors(e))
        }
        console.error(e)
      }
    },
    [createFieldMutation]
  )

  return (
    <Dialog onClose={onClose} title="Create field" size="sm">
      <FieldForm onSubmit={handleCreate} />
    </Dialog>
  )
}

export default CreateFieldModal
