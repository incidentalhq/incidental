import { FC } from 'react'
import styled, { css, keyframes } from 'styled-components'

const Spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

type RootProps = {
  $spin: boolean
  $fixedWidth: boolean
}
const Root = styled.div<RootProps>`
  display: inline-block;
  vertical-align: -0.125em;
  img {
    height: 1em;
    width: 1em;
    ${(props) =>
      props.$spin
        ? css`
            animation: ${Spin} 3s infinite linear;
          `
        : ''}

    ${(props) =>
      props.$fixedWidth
        ? css`
            text-align: center;
            width: 1.25em;
          `
        : ''}
  }
`

interface Props {
  icon: string
  spin?: boolean
  fixedWidth?: boolean
}

const Icon: FC<Props> = ({ icon, spin = false, fixedWidth = false }) => {
  return (
    <Root $spin={spin} $fixedWidth={fixedWidth}>
      <img src={icon} />
    </Root>
  )
}

export default Icon
