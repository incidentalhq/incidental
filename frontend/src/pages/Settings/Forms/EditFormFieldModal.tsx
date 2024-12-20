import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormikHelpers } from 'formik'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { IFormField, IIncidentSeverity, IIncidentStatus, IIncidentType } from '@/types/models'
import { apiErrorsToFormikErrors } from '@/utils/form'

import FormFieldSettingsForm, { FormValues } from './components/FormFieldSettingsForm'

interface Props {
  onClose: () => void
  formField: IFormField
  statusList: IIncidentStatus[]
  severityList: IIncidentSeverity[]
  incidentTypes: IIncidentType[]
}

const EditFormFieldModal: React.FC<Props> = ({ onClose, formField, statusList, severityList, incidentTypes }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const updateFormFieldMutation = useMutation({
    mutationFn: (value: Pick<IFormField, 'id'> & Partial<IFormField>) => apiService.patchFormField(value.id, value),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['form-fields']
      })
      toast('Form field updated', { type: 'success' })
      onClose()
    }
  })

  const createFormFieldUpdateHandler = useCallback(
    (formField: IFormField) => {
      return async (values: Partial<IFormField>, helpers: FormikHelpers<FormValues>) => {
        const newValues = {
          id: formField.id,
          ...values
        }
        try {
          await updateFormFieldMutation.mutateAsync(newValues)
        } catch (e) {
          if (e instanceof APIError) {
            helpers.setErrors(apiErrorsToFormikErrors(e))
            toast(e.message, { type: 'error' })
          }
          console.error(e)
        }
      }
    },
    [updateFormFieldMutation]
  )

  return (
    <Dialog onClose={onClose} title="Update form field" size="sm">
      <FormFieldSettingsForm
        formField={formField}
        onSubmit={createFormFieldUpdateHandler(formField)}
        statusList={statusList}
        severityList={severityList}
        incidentTypes={incidentTypes}
      />
    </Dialog>
  )
}

export default EditFormFieldModal
