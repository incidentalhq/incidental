import { Form, Formik, FormikHelpers } from 'formik'
import { useMemo } from 'react'
import * as Yup from 'yup'

import SelectField from '@/components/Form/SelectField'
import { StyledButton } from '@/components/Theme/Styles'
import { IIncident, IIncidentSeverity, ModelID } from '@/types/models'

interface Props {
  incident: IIncident
  severityList: IIncidentSeverity[]
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void
}

export interface FormValues {
  severity: ModelID
}

const validationSchema = Yup.object().shape({
  severity: Yup.string().required('Please select a severity')
})

const ChangeSeverityForm: React.FC<Props> = ({ severityList, incident, onSubmit }) => {
  const options = useMemo(() => severityList.map((it) => ({ label: it.name, value: it.id })), [severityList])
  const defaultValues = {
    severity: incident.incidentSeverity.id
  }

  return (
    <Formik<FormValues> validationSchema={validationSchema} initialValues={defaultValues} onSubmit={onSubmit}>
      {({ isSubmitting, values }) => (
        <Form className="space-y-2">
          <label>Severity</label>
          <div>
            <SelectField name="severity" options={options} saveOnChange={false} />
          </div>
          <div>
            <p>{severityList.find((it) => it.id === values.severity)?.description}</p>
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

export default ChangeSeverityForm
