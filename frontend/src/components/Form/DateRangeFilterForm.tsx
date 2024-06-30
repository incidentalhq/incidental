import { Form, Formik, FormikHelpers } from 'formik'
import styled from 'styled-components'
import * as Yup from 'yup'

import { StyledButton } from '../Theme/Styles'
import Field from './Field'
import GeneralError from './GeneralError'

const FormBody = styled.div`
  display: flex;
  align-items: center;
  > * {
    margin-right: 1rem;
  }
`

interface Props {
  onSubmit: (values: DateRangeFilterValues, helpers: FormikHelpers<DateRangeFilterValues>) => void
}

export interface DateRangeFilterValues {
  startDate: string
  endDate: string
}

const validationSchema = Yup.object().shape({
  startDate: Yup.date().required('Select a start date'),
  endDate: Yup.date().required('Select an end date')
})

const DateRangeFilterForm: React.FC<Props> = ({ onSubmit }) => {
  const defaultValues = {
    startDate: '',
    endDate: ''
  }

  return (
    <Formik<DateRangeFilterValues>
      validationSchema={validationSchema}
      initialValues={defaultValues}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <GeneralError />
          <FormBody>
            <div>
              <label className="block">Start date</label>
              <Field name="startDate" type="date" placeholder="Start date" />
            </div>
            <div>
              <label className="block">End date</label>
              <Field name="endDate" type="date" placeholder="End date" />
            </div>
            <div>
              <br />
              <StyledButton type="submit" disabled={isSubmitting}>
                Filter
              </StyledButton>
            </div>
          </FormBody>
        </Form>
      )}
    </Formik>
  )
}

export default DateRangeFilterForm
