import { Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'

import spinner from '@/assets/icons/spinner.svg'
import Field from '@/components/Form/Field'
import GeneralError from '@/components/Form/GeneralError'
import Icon from '@/components/Icon/Icon'
import { StyledButton } from '@/components/Theme/Styles'

export type FormValues = {
  emailAddress: string
}

interface Props {
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void | Promise<void>
}

const validationSchema = Yup.object().shape({
  emailAddress: Yup.string().email().required('Email address is required')
})

const CreateInviteForm: React.FC<Props> = ({ onSubmit }) => {
  const defaultValues: FormValues = {
    emailAddress: ''
  }

  return (
    <Formik validationSchema={validationSchema} onSubmit={onSubmit} initialValues={defaultValues}>
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <GeneralError />
          <div>
            <label>Email Address</label>
            <Field type="text" name="emailAddress" help="The email address of the person you wan to invite" />
          </div>
          <div>
            <StyledButton $primary={true} type="submit" disabled={isSubmitting}>
              {isSubmitting && <Icon spin={true} icon={spinner} />} Invite
            </StyledButton>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default CreateInviteForm
