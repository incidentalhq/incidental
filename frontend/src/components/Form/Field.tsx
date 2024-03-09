import { ErrorMessage, FieldAttributes, Field as FormikField, useField } from 'formik'
import styled from 'styled-components'

const HelpEl = styled.div`
  font-size: 0.9rem;
  color: var(--color-gray-500);
`

type CustomFieldAttributes<T> = FieldAttributes<T> & {
  help?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Field = <T,>(props: CustomFieldAttributes<T>) => {
  const [field, meta] = useField(props)
  let className = props.className

  if (meta.error && meta.touched) {
    className = `${className} error`
  }

  return (
    <>
      <FormikField {...props} className={className} />
      {props.help && !(meta.error && meta.touched) ? <HelpEl>{props.help}</HelpEl> : null}
      <ErrorMessage name={field.name} component="div" className="error-help" />
    </>
  )
}

export default Field
