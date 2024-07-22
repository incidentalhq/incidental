import { ReactNode, useId } from 'react'
import { Tooltip } from 'react-tooltip'

import { StyledButton, StyledButtonCustomProps } from '../Theme/Styles'

type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export interface ButtonProps extends HTMLButtonProps, StyledButtonCustomProps {
  whyDisabledText?: string // if button is marked as disabled, set this to show a tooltip
  children: ReactNode
  tooltip?: string // generic tooltip
}

const Button: React.FC<ButtonProps> = ({ children, whyDisabledText, tooltip, ...props }) => {
  const id = useId()
  return (
    <>
      <StyledButton id={id} {...props} data-tooltip-id={id}>
        {children}
      </StyledButton>
      {whyDisabledText && props.disabled && <Tooltip id={id} content={whyDisabledText} />}
      {tooltip && !whyDisabledText && !props.disabled && <Tooltip id={id} content={tooltip} />}
    </>
  )
}

export default Button
