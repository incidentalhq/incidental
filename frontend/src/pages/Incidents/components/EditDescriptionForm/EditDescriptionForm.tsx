import { Form, Formik, FormikHelpers } from 'formik'
import { useCallback, useState } from 'react'
import styled from 'styled-components'
import * as Yup from 'yup'

import Field from '@/components/Form/Field'
import { Button } from '@/components/Theme/Styles'
import { IIncident } from '@/types/models'

const Actions = styled.div`
  margin-top: 1rem;
`

interface Props {
  incident: IIncident
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void
}

export interface FormValues {
  description: string
}

const validationSchema = Yup.object().shape({
  description: Yup.string().required('Please provide a description of the incident')
})

const EditDescriptionForm: React.FC<Props> = ({ incident, onSubmit }) => {
  const [editing, setEditing] = useState(false)
  const defaultValues = {
    description: incident.description ?? ''
  }
  const handleSubmit = useCallback(
    (values: FormValues, helpers: FormikHelpers<FormValues>) => {
      setEditing(false)
      onSubmit(values, helpers)
    },
    [onSubmit]
  )

  return (
    <>
      {!editing ? (
        <>
          <p>{incident.description}</p>
          <Actions>
            <Button type="button" onClick={() => setEditing(true)}>
              Edit description
            </Button>
          </Actions>
        </>
      ) : (
        <Formik<FormValues> validationSchema={validationSchema} initialValues={defaultValues} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form className="space-y-2">
              <div>
                <Field name="description" type="text" className="w-full" as={'textarea'} />
              </div>
              <div>
                <Button type="submit" disabled={isSubmitting}>
                  Save
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </>
  )
}

export default EditDescriptionForm
