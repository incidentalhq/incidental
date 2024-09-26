import { ErrorMessage, useField } from 'formik'
import Select, { MultiValue } from 'react-select'

type Option = {
  value: string | number
  label: string
}

interface Props {
  name: string
  options: Array<Option>
}

const MultiSelectField: React.FC<Props> = ({ name, options }) => {
  const [field, , helpers] = useField(name)

  const handleChange = (newValue: MultiValue<Option>) => {
    const values = newValue.map((it) => it.value)
    helpers.setValue(values)
  }

  return (
    <>
      <Select
        value={options.filter((it) => field.value && field.value.includes(it.value))}
        options={options}
        isMulti={true}
        onChange={handleChange}
        isClearable={false}
      />
      <ErrorMessage name={field.name} component="div" className="error-help" />
    </>
  )
}

export default MultiSelectField
