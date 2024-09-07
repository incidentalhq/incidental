import { Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'

import spinner from '@/assets/icons/spinner.svg'
import GeneralError from '@/components/Form/GeneralError'
import SelectField from '@/components/Form/SelectField'
import Icon from '@/components/Icon/Icon'
import { StyledButton } from '@/components/Theme/Styles'
import { IField } from '@/types/models'

export type FormValues = {
  field: {
    id: string
  }
}

interface Props {
  fields: Array<IField>
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void | Promise<void>
}

const schema = Yup.object().shape({
  field: Yup.object().shape({
    id: Yup.string().required()
  })
})

const AddFormFieldForm: React.FC<Props> = ({ onSubmit, fields }) => {
  const defaultValues: FormValues = {
    field: {
      id: ''
    }
  }
  const options = fields.map((it) => ({
    label: it.label,
    value: it.id
  }))

  return (
    <Formik onSubmit={onSubmit} initialValues={defaultValues} validationSchema={schema}>
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <GeneralError />
          <div>
            <label>New form field</label>
            <SelectField name="field.id" options={options} />
          </div>
          <div>
            <StyledButton $primary={true} type="submit" disabled={isSubmitting}>
              {isSubmitting && <Icon spin={true} icon={spinner} />} Add field
            </StyledButton>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default AddFormFieldForm
