import { Form, Formik, FormikHelpers } from 'formik'
import React from 'react'
import styled from 'styled-components'
import * as Yup from 'yup'

import Button from '@/components/Button/Button'
import Field from '@/components/Form/Field'
import { IStatusPage } from '@/types/models'

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`

interface Props {
  statusPage: IStatusPage
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void
  onDelete: () => void
}

export interface FormValues {
  customDomain: string
}

const validationSchema = Yup.object({
  customDomain: Yup.string()
})

const DomainSettingsForm: React.FC<Props> = ({ onSubmit, statusPage, onDelete }) => {
  const initialValues = {
    customDomain: statusPage.customDomain ? statusPage.customDomain : ''
  }

  return (
    <div>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({ isSubmitting }) => (
          <Form className="space-y-2">
            <div>
              <label htmlFor="customDomain">Custom domain</label>
              <Field type="text" id="customDomain" name="customDomain" />
            </div>
            <Actions>
              <Button disabled={isSubmitting} type="submit">
                Save
              </Button>{' '}
              <a href="#" onClick={onDelete}>
                Delete domain
              </a>
            </Actions>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default DomainSettingsForm
