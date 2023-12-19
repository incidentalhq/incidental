import { Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'

import Field from '@/components/Form/Field'
import GeneralError from '@/components/Form/GeneralError'
import { Button } from '@/components/Theme/Styles'
import { ITeam } from '@/types/models'

interface Props {
  team?: ITeam
  onSubmit: (values: TeamFormValues, helpers: FormikHelpers<TeamFormValues>) => void
}

export type TeamFormValues = {
  name: string
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Enter a name of this team')
})

const TeamForm: React.FC<Props> = ({ onSubmit, team }) => {
  const defaultValues = {
    name: team ? team.name : ''
  }

  return (
    <Formik<TeamFormValues> validationSchema={validationSchema} initialValues={defaultValues} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <GeneralError />
          <div>
            <label className="block">Name</label>
            <Field name="name" type="text" className="w-full" help="A name for this team" />
          </div>
          <div>
            <Button type="submit" disabled={isSubmitting}>
              {team ? 'Update team' : 'Create team'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default TeamForm
