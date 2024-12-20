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
  field: IField
}

const EditFieldModal: React.FC<Props> = ({ onClose, field }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const patchFieldMutation = useMutation({
    mutationFn: (values: Partial<IField>) => apiService.patchField(field, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['fields']
      })
      onClose()
    }
  })

  const handlePatch = useCallback(
    async (values: Partial<IField>, helpers: FormikHelpers<FormValues>) => {
      try {
        await patchFieldMutation.mutateAsync(values)
      } catch (e) {
        if (e instanceof APIError) {
          helpers.setErrors(apiErrorsToFormikErrors(e))
        }
        console.error(e)
      }
    },
    [patchFieldMutation]
  )

  return (
    <Dialog onClose={onClose} title="Edit field" size="sm">
      <FieldForm field={field} onSubmit={handlePatch} />
    </Dialog>
  )
}

export default EditFieldModal
