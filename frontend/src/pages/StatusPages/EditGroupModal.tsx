import { useMutation, useQueryClient } from '@tanstack/react-query'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { IStatusPage } from '@/types/models'

import GroupForm, { FormValues } from './components/GroupForm'

import { GroupValue } from './types'

interface Props {
  onClose: () => void
  group: GroupValue
  statusPage: IStatusPage
}

const EditGroupModal: React.FC<Props> = ({ onClose, group, statusPage }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const createStatusPageMutation = useMutation({
    mutationFn: (value: FormValues) => apiService.editStatusPageGroup(statusPage.id, group.id, value),
    onSuccess: () => {
      onClose()
      queryClient.invalidateQueries({ queryKey: ['get-status-page', statusPage.id] })
    }
  })

  const handleSubmit = (values: FormValues) => {
    createStatusPageMutation.mutateAsync({
      ...values
    })
  }

  return (
    <Dialog onClose={onClose} title="Edit group">
      <GroupForm onSubmit={handleSubmit} group={group} />
    </Dialog>
  )
}

export default EditGroupModal
