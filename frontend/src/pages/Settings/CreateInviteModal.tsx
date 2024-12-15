import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormikHelpers } from 'formik'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { IOrganisation } from '@/types/models'
import { apiErrorsToFormikErrors } from '@/utils/form'

import CreateInviteForm, { FormValues } from './components/CreateInviteForm'

interface Props {
  organisation: IOrganisation
  onClose: () => void
}

const CreateInviteModal: React.FC<Props> = ({ onClose, organisation }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (values: FormValues) => apiService.createInvite(values),
    onSuccess: () => {
      onClose()
      queryClient.invalidateQueries({ queryKey: [organisation.id, 'invites'] })
      toast('Invite created', { type: 'success' })
    }
  })

  const handleSubmit = async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
    try {
      await mutation.mutateAsync({
        ...values
      })
    } catch (error) {
      if (error instanceof APIError) {
        helpers.setErrors(apiErrorsToFormikErrors(error))
      }
    }
  }

  return (
    <Dialog onClose={onClose} title="Invite user to organisation">
      <CreateInviteForm onSubmit={handleSubmit} />
    </Dialog>
  )
}

export default CreateInviteModal
