import React from 'react'
import styled from 'styled-components'

interface Props {
  isSelected: boolean
  onClick: () => void
}

const Checkbox = styled.input`
  cursor: default;
  appearance: none;
  background-color: var(--color-slate-300);
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
    background-color: var(--color-slate-300);
    transition-duration: 0s;
  }

  &:checked {
    background-color: var(--color-green-500);
  }

  &:checked:after {
    background-color: #fff;
    left: 13px;
  }

  &:checked:hover {
    background-color: var(--color-green-600);
  }

  &:focus:not(.focus-visible) {
    outline: 0;
  }
`

const CheckboxToggle: React.FC<Props> = ({ isSelected, onClick }) => {
  return <Checkbox type="checkbox" checked={isSelected} onClick={onClick} />
}

export default CheckboxToggle
