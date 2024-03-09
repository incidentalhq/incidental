import { ErrorMessage, useField, useFormikContext } from 'formik'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

const Clear = styled.a`
  padding-left: 0.5rem;
  text-decoration: none;
`
const HelpEl = styled.div`
  font-size: 0.9rem;
  color: var(--color-gray-500);
`

interface Props {
  className?: string
  name: string
  options: Array<{ value: number | string; label: string }>
  requiredLabel?: string
  clearable?: boolean
  onChangeValue?: (value: number | string | undefined) => void
  help?: string
  saveOnChange?: boolean
}

export const NOT_SET_VALUE = '__not_set__'

const SelectField: React.FC<Props> = ({
  name,
  options,
  requiredLabel = 'Select an option',
  clearable,
  onChangeValue,
  help,
  saveOnChange = false,
  ...inputProps
}) => {
  const [field, meta, helpers] = useField(name)
  const [isValueSelected, setIsValueSelected] = useState(false)
  const [key, setKey] = useState(1)
  const [className, setClassName] = useState(inputProps.className)
  const formContext = useFormikContext()

  // set class name if there is an error
  useEffect(() => {
    if (meta.error && meta.touched) {
      setClassName(`${className} is-invalid`)
    } else {
      setClassName(className)
    }
  }, [meta.error, meta.touched])

  useEffect(() => {
    setIsValueSelected(options.find((it) => it.value == field.value) ? true : false)
  }, [options, field.value])

  const handleClearClick = (evt: React.SyntheticEvent<HTMLAnchorElement>) => {
    evt.preventDefault()
    helpers.setValue(undefined)
    setIsValueSelected(false)
    setKey((prev) => prev + 1)
    if (onChangeValue) onChangeValue(undefined)
  }

  const handleChange = async (evt: React.ChangeEvent<HTMLSelectElement>) => {
    if (evt.target.value === NOT_SET_VALUE) {
      helpers.setValue(undefined)
      setIsValueSelected(false)
    } else {
      helpers.setValue(evt.target.value)
      setIsValueSelected(true)
    }
    if (onChangeValue) {
      onChangeValue(evt.target.value)
    }
    if (saveOnChange && !formContext.isSubmitting) {
      await formContext.submitForm()
    }
  }

  return (
    <>
      <select key={key} onChange={handleChange} value={field.value} {...inputProps} className={className}>
        {!isValueSelected ? <option value={NOT_SET_VALUE}>{requiredLabel}</option> : null}
        {options.map((option) => {
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )
        })}
      </select>
      {clearable ? (
        <Clear onClick={handleClearClick} href="#clear">
          Clear
        </Clear>
      ) : null}
      {help && !(meta.error && meta.touched) ? <HelpEl>{help}</HelpEl> : null}
      <ErrorMessage name={field.name} component="div" className="error-help" />
    </>
  )
}

export default SelectField
