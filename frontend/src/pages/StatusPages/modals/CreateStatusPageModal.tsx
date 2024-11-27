import { useMutation } from '@tanstack/react-query'
import { generatePath, useNavigate } from 'react-router-dom'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { RoutePaths } from '@/routes'
import { StatusPageKind } from '@/types/enums'
import { IStatusPage } from '@/types/models'

import CreateStatusPageForm, { FormValues as CreateStatusPageValues } from '../components/CreateStatusPageForm'

interface Props {
  onClose: () => void
}

const CreateStatusPageModal: React.FC<Props> = ({ onClose }) => {
  const { apiService } = useApiService()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (value: Partial<IStatusPage>) => apiService.createStatusPage(value),
    onSuccess: (result) => {
      onClose()
      navigate(generatePath(RoutePaths.STATUS_PAGE_SHOW, { id: result.id }))
    }
  })

  const handleSubmit = (values: CreateStatusPageValues) => {
    mutation.mutateAsync({
      ...values,
      pageType: StatusPageKind.PUBLIC
    })
  }

  return (
    <Dialog onClose={onClose} title="Create new status page">
      <CreateStatusPageForm onSubmit={handleSubmit} />
    </Dialog>
  )
}

export default CreateStatusPageModal
