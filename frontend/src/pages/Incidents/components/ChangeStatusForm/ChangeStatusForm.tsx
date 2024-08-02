import { useQuery } from '@tanstack/react-query'
import { Form, Formik, FormikHelpers } from 'formik'
import { useCallback, useMemo } from 'react'
import * as Yup from 'yup'

import SelectField from '@/components/Form/SelectField'
import Loading from '@/components/Loading/Loading'
import { StyledButton } from '@/components/Theme/Styles'
import useApiService from '@/hooks/useApi'
import useGlobal from '@/hooks/useGlobal'
import { IIncident, ModelID } from '@/types/models'

interface Props {
  incident: IIncident
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void
}

export interface FormValues {
  status: ModelID
}

const validationSchema = Yup.object().shape({
  status: Yup.string().required('Please set a status')
})

const ChangeStatusForm: React.FC<Props> = ({ incident, onSubmit }) => {
  const { apiService } = useApiService()
  const { organisation } = useGlobal()

  const incidentStatusQuery = useQuery({
    queryKey: ['incident-statuses', organisation!.id],
    queryFn: () => apiService.getIncidentStatuses()
  })

  const options = useMemo(() => {
    if (!incidentStatusQuery.isSuccess) {
      return []
    }
    return incidentStatusQuery.data.items.map((it) => ({ label: it.name, value: it.id }))
  }, [incidentStatusQuery.data?.items, incidentStatusQuery.isSuccess])

  const defaultValues = {
    status: incident.incidentStatus.id
  }

  const handleSubmit = useCallback(
    (values: FormValues, helpers: FormikHelpers<FormValues>) => {
      onSubmit(values, helpers)
    },
    [onSubmit]
  )

  if (!incidentStatusQuery.isSuccess) {
    return <Loading />
  }

  return (
    <Formik<FormValues> validationSchema={validationSchema} initialValues={defaultValues} onSubmit={handleSubmit}>
      {({ isSubmitting, values }) => (
        <Form className="space-y-2">
          <label>Status</label>
          <div>
            <SelectField name="status" options={options} saveOnChange={false} />
          </div>
          <div>
            <p>{incidentStatusQuery.data.items.find((it) => it.id == values.status)?.description}</p>
          </div>
          <div>
            <StyledButton type="submit" disabled={isSubmitting}>
              Save
            </StyledButton>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default ChangeStatusForm
