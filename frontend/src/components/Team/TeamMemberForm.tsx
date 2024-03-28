import { Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'

import Field from '@/components/Form/Field'
import GeneralError from '@/components/Form/GeneralError'
import { Button } from '@/components/Theme/Styles'

interface Props {
  onSubmit: (values: TeamMemberFormValues, helpers: FormikHelpers<TeamMemberFormValues>) => void
}

export type TeamMemberFormValues = {
  email: string
}

const validationSchema = Yup.object().shape({
  email: Yup.string().email().required('An email address is required')
})

const TeamMemberForm: React.FC<Props> = ({ onSubmit }) => {
  const defaultValues = {
    email: ''
  }

  return (
    <Formik<TeamMemberFormValues> validationSchema={validationSchema} initialValues={defaultValues} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <GeneralError />
          <div>
            <label className="block">User</label>
            <Field
              name="email"
              type="text"
              className="w-full"
              help="The email address of the user"
              placeholder="An email address"
            />
          </div>
          <div>
            <Button type="submit" disabled={isSubmitting}>
              Add
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default TeamMemberForm
