import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormikHelpers } from 'formik'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { IIncidentRole } from '@/types/models'
import { apiErrorsToFormikErrors } from '@/utils/form'

import RoleForm, { FormValues } from '../components/Role/RoleForm'

interface Props {
  onClose: () => void
  role: IIncidentRole
}

const EditRoleModal: React.FC<Props> = ({ onClose, role }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const updateRoleMutation = useMutation({
    mutationFn: (values: FormValues) => apiService.updateRole(role, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['roles']
      })
      onClose()
      toast('Role updated', { type: 'success' })
    }
  })

  const handleUpdateRole = useCallback(
    async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
      try {
        await updateRoleMutation.mutateAsync(values)
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.detail, { type: 'error' })
          helpers.setErrors(apiErrorsToFormikErrors(e))
        }
        console.error(e)
      }
    },
    [updateRoleMutation]
  )

  return (
    <Dialog onClose={onClose} title="Edit role" size="sm">
      <RoleForm role={role} onSubmit={handleUpdateRole} />
    </Dialog>
  )
}

export default EditRoleModal
