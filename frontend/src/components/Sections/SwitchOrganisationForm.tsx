import { Form, Formik, FormikHelpers } from 'formik'
import { useMemo } from 'react'
import * as Yup from 'yup'

import { IOrganisation } from '@/types/models'

import SelectField from '../Form/SelectField'

interface Props {
  currentOrganisation: IOrganisation
  organisations: IOrganisation[]
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void
}

export interface FormValues {
  organisationId: string
}

const validationSchema = Yup.object().shape({
  organisationId: Yup.string().required('Please select an organisation')
})

const SwitchOrganisationForm: React.FC<Props> = ({ currentOrganisation, organisations, onSubmit }) => {
  const defaultValues = {
    organisationId: currentOrganisation.id
  }
  const options = useMemo(
    () =>
      organisations.map((it) => ({
        label: it.name,
        value: it.id
      })),
    [organisations]
  )

  return (
    <Formik<FormValues>
      validationSchema={validationSchema}
      initialValues={defaultValues}
      onSubmit={onSubmit}
      enableReinitialize={true} // because we change initial values whenever we switch organisation
    >
      <Form>
        <SelectField name="organisationId" options={options} saveOnChange={true} />
      </Form>
    </Formik>
  )
}

export default SwitchOrganisationForm
