import { Form, Formik, FormikHelpers } from 'formik'
import { useMemo } from 'react'
import * as Yup from 'yup'

import { getCustomField } from '@/components/Incident/Field/getFieldComponent'
import { createCustomDefaultFieldValue, createCustomFieldValidationSchema } from '@/components/Incident/Field/utils'
import { StyledButton } from '@/components/Theme/Styles'
import { IField, IIncident, IIncidentFieldValue } from '@/types/models'

interface Props {
  incident: IIncident
  field: IField
  value: IIncidentFieldValue | null
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void
}

export interface FormValues {
  [x: string]: string | Array<string> | undefined
}

const FieldForm: React.FC<Props> = ({ value, field, onSubmit }) => {
  const defaultValues = useMemo(() => createCustomDefaultFieldValue(field, value), [field, value])
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        [field.id]: createCustomFieldValidationSchema(field)
      }),
    [field]
  )

  return (
    <Formik<FormValues> validationSchema={validationSchema} initialValues={defaultValues} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <div>
            <p>{field.description}</p>
          </div>
          <div>
            <label>{field.label}</label>
            {getCustomField(field.id, field)}
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

export default FieldForm
