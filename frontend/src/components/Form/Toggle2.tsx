import React from 'react'
import styled from 'styled-components'

interface Props {
  isSelected: boolean
  onClick: () => void
}

const Root = styled.div``
const Checkbox = styled.input`
  cursor: default;
  appearance: none;
  background-color: #dfe1e4;
  border-radius: 72px;
  border-style: none;
  flex-shrink: 0;
  height: 20px;
  margin: 0;
  position: relative;
  width: 30px;
  transition: all 100ms ease-out;

  &:before {
    bottom: -6px;
    content: '';
    left: -6px;
    position: absolute;
    right: -6px;
    top: -6px;
  }

  &:after {
    background-color: #fff;
    border-radius: 50%;
    content: '';
    height: 14px;
    left: 3px;
    position: absolute;
    top: 3px;
    width: 14px;
    transition: all 100ms ease-out;
  }

  &:hover {
    background-color: #c9cbcd;
    transition-duration: 0s;
  }

  &:checked {
    background-color: #6e79d6;
  }

  &:checked:after {
    background-color: #fff;
    left: 13px;
  }

  &:checked:hover {
    background-color: #535db3;
  }

  &:focus:not(.focus-visible) {
    outline: 0;
  }
`

const Toggle2: React.FC<Props> = ({ isSelected, onClick }) => {
  return (
    <Root>
      <Checkbox type="checkbox" checked={isSelected} onClick={onClick} />
    </Root>
  )
}

export default Toggle2
