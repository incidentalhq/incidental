import { Form, Formik, FormikHelpers } from 'formik'
import { createRef, useState } from 'react'
import styled from 'styled-components'
import * as Yup from 'yup'

import Field from '@/components/Form/Field'
import { IIncident } from '@/types/models'

const Root = styled.div`
  input[type='text'] {
    border: 0;
    margin: 0;
    box-shadow: none;
  }
`

interface Props {
  incident: IIncident
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void
}

export interface FormValues {
  name: string
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name of incident cannot be blank')
})

const EditTitleForm: React.FC<Props> = ({ incident, onSubmit }) => {
  const [isEditing, setIsEditing] = useState(false)
  const ref = createRef<HTMLFormElement>()
  const defaultValues = {
    name: incident.name
  }

  const handleSubmit = (values: FormValues, helpers: FormikHelpers<FormValues>) => {
    ref.current?.blur()
    onSubmit(values, helpers)
    setIsEditing(false)
  }

  return (
    <Root>
      {isEditing ? (
        <Formik<FormValues> validationSchema={validationSchema} initialValues={defaultValues} onSubmit={handleSubmit}>
          {() => (
            <Form>
              <Field ref={ref} name="name" type="text" data-1p-ignore />
            </Form>
          )}
        </Formik>
      ) : (
        <div onClick={() => setIsEditing(true)}>{incident.name}</div>
      )}
    </Root>
  )
}

export default EditTitleForm
