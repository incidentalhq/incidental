import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { IIncident, IIncidentRole, IOrganisationMember } from '@/types/models'

import RoleForm, { FormValues } from '../components/RoleForm/RoleForm'

interface Props {
  onClose: () => void
  incident: IIncident
  role: IIncidentRole
  members: IOrganisationMember[]
}

const AssignRoleModal: React.FC<Props> = ({ onClose, incident, role, members }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const setRoleMutation = useMutation({
    mutationFn: (values: FormValues) => apiService.setUserRole(incident, values.user, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['incident', incident.id]
      })
      onClose()
    }
  })

  const handleSetRole = useCallback(
    async (values: FormValues) => {
      try {
        await setRoleMutation.mutateAsync(values)
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.detail, { type: 'error' })
        }
        console.error(e)
      }
    },
    [setRoleMutation]
  )

  return (
    <Dialog onClose={onClose} title="Assign role" size="sm">
      <RoleForm users={members.map((it) => it.user)} incident={incident} role={role} onSubmit={handleSetRole} />
    </Dialog>
  )
}

export default AssignRoleModal
