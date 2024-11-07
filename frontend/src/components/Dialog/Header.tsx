import React from 'react'
import styled from 'styled-components'

interface DialogHeaderProps {
  title: string
  onClose: () => void
}

const DialogTitle = styled.div`
  position: relative;
  font-weight: 500;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  font-size: 1.25rem;
`

const CloseButton = styled.button`
  margin-left: auto;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #9e9e9e;

  &:hover {
    color: #616161;
  }
`

const DialogHeader: React.FC<DialogHeaderProps> = ({ title, onClose }) => {
  return (
    <DialogTitle>
      {title}
      <CloseButton aria-label="close" onClick={onClose}>
        &times;
      </CloseButton>
    </DialogTitle>
  )
}

export default DialogHeader
