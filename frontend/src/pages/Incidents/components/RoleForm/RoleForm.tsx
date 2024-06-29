import { Form, Formik, FormikHelpers } from 'formik'
import { useCallback, useMemo } from 'react'
import * as Yup from 'yup'

import SelectField from '@/components/Form/SelectField'
import { Button } from '@/components/Theme/Styles'
import { IIncident, IIncidentRole, IPublicUser, ModelID } from '@/types/models'

interface Props {
  incident: IIncident
  role: IIncidentRole
  users: Array<IPublicUser>
  onSubmit: (values: FormValues, helpers: FormikHelpers<InternalFormValues>) => void
}

export interface FormValues {
  user: IPublicUser
}

export interface InternalFormValues {
  userId: ModelID
}

const validationSchema = Yup.object().shape({
  userId: Yup.string().required('Please select a user')
})

const RoleForm: React.FC<Props> = ({ users, onSubmit, role, incident }) => {
  const options = useMemo(() => users.map((it) => ({ label: it.name, value: it.id })), [users])
  const currentAssignment = incident.incidentRoleAssignments.find((it) => it.incidentRole.id === role.id)
  const defaultValues = {
    userId: currentAssignment ? currentAssignment.user.id : ('' as ModelID)
  }
  const handleSubmit = useCallback(
    (values: InternalFormValues, helpers: FormikHelpers<InternalFormValues>) => {
      const user = users.find((it) => it.id === values.userId)
      if (!user) {
        throw Error('Could not find user')
      }

      onSubmit({ user }, helpers)
    },
    [onSubmit, users]
  )

  return (
    <Formik<InternalFormValues>
      validationSchema={validationSchema}
      initialValues={defaultValues}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <label>{role.name}</label>
          <div>
            <SelectField name="userId" options={options} saveOnChange={false} />
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

export default RoleForm
