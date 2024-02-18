import { useField } from 'formik'

interface Props {
  name: string
}

const ErrorMessage: React.FC<Props> = (props) => {
  const [, meta] = useField(props)

  const showError = meta.touched && meta.error && typeof meta.error === 'string'

  if (showError) {
    return <div className="error-help">{meta.error}</div>
  }

  return null
}

export default ErrorMessage
