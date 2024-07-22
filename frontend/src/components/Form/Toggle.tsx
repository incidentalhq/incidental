import React from 'react'
import styled from 'styled-components'

interface Props {
  isSelected: boolean
  onClick: () => void
}

interface InnerProps {
  $checked: boolean
}

const Root = styled.label<InnerProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  width: 50px;
  height: 16px;
  background: ${(props) => (props.$checked ? 'var(--color-green-500)' : 'var(--color-gray-300)')};
  border-radius: 50px;
  position: relative;
  transition: background-color 0.2s;
`

const ToggleSpan = styled.span<InnerProps>`
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 24px;
  transition: 0.2s;
  background: #fff;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-gray-400);

  ${(props) => (props.$checked ? `right: 24px; transform: translateX(100%);` : `left: 0;`)}
`

const Toggle: React.FC<Props> = ({ isSelected, onClick }) => {
  return (
    <Root $checked={isSelected} onClick={onClick}>
      <ToggleSpan $checked={isSelected} />
    </Root>
  )
}

export default Toggle
