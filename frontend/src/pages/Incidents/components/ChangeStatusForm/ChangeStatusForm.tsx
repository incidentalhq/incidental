import { Form, Formik, FormikHelpers } from 'formik'
import { useCallback, useMemo } from 'react'
import * as Yup from 'yup'

import SelectField from '@/components/Form/SelectField'
import { Button } from '@/components/Theme/Styles'
import { IIncident, IIncidentStatus, ModelID } from '@/types/models'

interface Props {
  incident: IIncident
  statusList: IIncidentStatus[]
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void
}

export interface FormValues {
  status: ModelID
}

const validationSchema = Yup.object().shape({
  status: Yup.string().required('Please set a status')
})

const ChangeStatusForm: React.FC<Props> = ({ statusList, incident, onSubmit }) => {
  const options = useMemo(() => statusList.map((it) => ({ label: it.name, value: it.id })), [statusList])
  const defaultValues = {
    status: incident.incidentStatus.id
  }
  const handleSubmit = useCallback(
    (values: FormValues, helpers: FormikHelpers<FormValues>) => {
      console.log('xxx')
      onSubmit(values, helpers)
    },
    [onSubmit]
  )

  return (
    <Formik<FormValues> validationSchema={validationSchema} initialValues={defaultValues} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <label>Status</label>
          <div>
            <SelectField name="status" options={options} saveOnChange={false} />
          </div>
          <div>
            <Button type="submit" disabled={isSubmitting}>
              Save
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default ChangeStatusForm
