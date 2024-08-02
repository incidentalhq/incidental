import { Form, Formik, FormikHelpers } from 'formik'
import styled from 'styled-components'
import * as Yup from 'yup'

import AutoSave from '@/components/Form/Autosave'
import GeneralError from '@/components/Form/GeneralError'
import Switch from '@/components/Form/Switch'
import { ILifecycle } from '@/types/models'

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export type FormValues = {
  isTriageAvailable: boolean
}

interface Props {
  lifecycle?: ILifecycle
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void | Promise<void>
}

const validationSchema = Yup.object().shape({
  isTriageAvailable: Yup.bool().required()
})

const TriageToggleForm: React.FC<Props> = ({ onSubmit, lifecycle }) => {
  const defaultValues: FormValues = {
    isTriageAvailable: lifecycle ? lifecycle.isTriageAvailable : false
  }

  return (
    <Formik
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      initialValues={defaultValues}
      enableReinitialize={true}
    >
      {() => (
        <Form className="space-y-2">
          <AutoSave debounceMs={100} />
          <GeneralError />
          <p>Allow users to create incidents in the Triage state</p>
          <Row>
            <label>Triage available</label>
            <Switch name="isTriageAvailable" />
          </Row>
        </Form>
      )}
    </Formik>
  )
}

export default TriageToggleForm
