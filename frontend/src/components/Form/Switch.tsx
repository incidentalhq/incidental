import { useField } from 'formik'
import styled from 'styled-components'

import Toggle from './Toggle'

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
  const [field, , helpers] = useField(name)
  const isChecked = field.value === onValue ? true : false

  return (
    <Root>
      <Toggle isSelected={isChecked} onClick={() => helpers.setValue(isChecked ? offValue : onValue)} />
    </Root>
  )
}

export default Switch
