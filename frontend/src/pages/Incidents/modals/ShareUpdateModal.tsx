import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import ShareUpdateForm, { FormValues } from '@/components/Incident/ShareUpdateForm'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { APIError } from '@/services/transport'
import { FormType } from '@/types/enums'
import { IIncident } from '@/types/models'
import { ICombinedFieldAndValue } from '@/types/special'

interface Props {
  onClose: () => void
  fieldValues: ICombinedFieldAndValue[]
  incident: IIncident
}

const ShareUpdateModal: React.FC<Props> = ({ onClose, incident, fieldValues }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()
  const { forms } = useGlobal()

  const updateIncidentForm = useMemo(() => forms.find((it) => it.type === FormType.UPDATE_INCIDENT), [forms])

  const createIncidentUpdateMutation = useMutation({
    mutationFn: (values: FormValues) => apiService.createIncidentUpdate(incident.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['incident-updates', incident.id]
      })
      onClose()
    }
  })

  const handleShareUpdate = useCallback(
    async (values: FormValues) => {
      try {
        await createIncidentUpdateMutation.mutateAsync(values)
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.detail, { type: 'error' })
        }
        console.error(e)
      }
    },
    [createIncidentUpdateMutation]
  )

  if (!updateIncidentForm) {
    return <p>Update form not found for organisation</p>
  }

  return (
    <Dialog onClose={onClose} title="Share incident update" size="lg">
      <ShareUpdateForm
        fieldValues={fieldValues}
        onSubmit={handleShareUpdate}
        incident={incident}
        form={updateIncidentForm}
      />
    </Dialog>
  )
}

export default ShareUpdateModal
