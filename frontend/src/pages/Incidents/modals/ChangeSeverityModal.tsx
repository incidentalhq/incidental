import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

import Dialog from '@/components/Dialog/Dialog'
import useApiService from '@/hooks/useApi'
import { APIError } from '@/services/transport'
import { IIncident, IIncidentSeverity } from '@/types/models'

import ChangeSeverityForm, { FormValues } from '../components/ChangeSeverityForm/ChangeSeverityForm'

interface Props {
  onClose: () => void
  incident: IIncident
  severityList: IIncidentSeverity[]
}

const ChangeSeverityModal: React.FC<Props> = ({ onClose, incident, severityList }) => {
  const { apiService } = useApiService()
  const queryClient = useQueryClient()

  const changeSeverityMutation = useMutation({
    mutationFn: (values: FormValues) =>
      apiService.patchIncident(incident.id, {
        incidentSeverity: {
          id: values.severity
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['incident', incident.id]
      })
      queryClient.invalidateQueries({
        queryKey: ['incident-updates', incident.id]
      })
      onClose()
    }
  })

  const handleChangeSeverity = useCallback(
    async (values: FormValues) => {
      try {
        await changeSeverityMutation.mutateAsync(values)
      } catch (e) {
        if (e instanceof APIError) {
          toast(e.detail, { type: 'error' })
        }
        console.error(e)
      }
    },
    [changeSeverityMutation]
  )

  return (
    <Dialog onClose={onClose} title="Change severity" size="sm">
      <p>Change the severity of the incident below</p>
      <ChangeSeverityForm severityList={severityList} incident={incident} onSubmit={handleChangeSeverity} />
    </Dialog>
  )
}

export default ChangeSeverityModal
