import { useField } from 'formik'
import styled from 'styled-components'

import CheckboxToggle from './CheckboxToggle'

const Root = styled.div`
  display: inline-block;
  padding: 0.5rem 0;
`

interface Props {
  name: string
  onValue?: string | number | boolean
  offValue?: string | number | boolean
}

const Switch: React.FC<Props> = ({ name, onValue = true, offValue = false }) => {
  const [field, o, helpers] = useField(name)
  const isChecked = field.value === onValue ? true : false

  return (
    <Root>
      <CheckboxToggle isSelected={isChecked} onClick={() => helpers.setValue(isChecked ? offValue : onValue)} />
    </Root>
  )
}

export default Switch
