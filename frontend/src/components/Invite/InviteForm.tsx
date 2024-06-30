import { Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'

import Field from '@/components/Form/Field'
import { StyledButton } from '@/components/Theme/Styles'

const validationSchema = Yup.object().shape({
  emailAddress: Yup.string().required('An email address is required').email()
})

interface Props {
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void
}

export interface FormValues {
  emailAddress: string
}

const InviteForm: React.FC<Props> = ({ onSubmit }) => {
  const defaultValues: FormValues = {
    emailAddress: ''
  }

  return (
    <Formik<FormValues> validationSchema={validationSchema} initialValues={defaultValues} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <div>
            <label className="block">Email address</label>
            <Field name="emailAddress" type="text" placeholder="Your team mate's email address" />
          </div>
          <div>
            <StyledButton type="submit" disabled={isSubmitting}>
              Send
            </StyledButton>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default InviteForm
