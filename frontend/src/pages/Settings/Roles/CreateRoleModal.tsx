import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormikHelpers } from 'formik'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { apiErrorsToFormikErrors } from '@/utils/form'

import RoleForm, { FormValues } from '../components/Role/RoleForm'

interface Props {
  onClose: () => void
}

const CreateRoleModal: React.FC<Props> = ({ onClose }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const createRoleMutation = useMutation({
    mutationFn: (values: FormValues) => apiService.createRole(values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['roles']
      })
      onClose()
      toast('Role created', { type: 'success' })
    }
  })

  const handleCreateRole = useCallback(
    async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
      try {
        await createRoleMutation.mutateAsync(values)
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.detail, { type: 'error' })
          helpers.setErrors(apiErrorsToFormikErrors(e))
        }
        console.error(e)
      }
    },
    [createRoleMutation]
  )

  return (
    <Dialog onClose={onClose} title="Create role" size="sm">
      <RoleForm onSubmit={handleCreateRole} />
    </Dialog>
  )
}

export default CreateRoleModal
