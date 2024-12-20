import { useState } from 'react'
import styled from 'styled-components'

import Dialog from '@/components/Dialog/Dialog'

import { StyledButton } from '../Theme/Styles'
import Button, { ButtonProps } from './Button'

const ConfirmMessage = styled.div`
  margin-bottom: 1rem;
`
const Actions = styled.div`
  display: flex;
  gap: 1rem;
`

interface Props extends ButtonProps {
  onConfirm: () => void
  message?: string
}

// Modal for confirming delete
const ConfirmDeleteModal = ({
  onClose,
  onConfirm,
  message
}: {
  onClose: () => void
  onConfirm: () => void
  message?: string
}) => {
  const handleConfirm = (evt: React.SyntheticEvent<HTMLButtonElement>) => {
    evt.preventDefault()
    onConfirm()
  }

  return (
    <Dialog onClose={onClose} title="Confirm Delete" size="sm">
      <ConfirmMessage>{message ? message : 'Are you sure you want to delete this?'}</ConfirmMessage>
      <Actions>
        <StyledButton $danger={true} onClick={handleConfirm}>
          Delete
        </StyledButton>
        <StyledButton onClick={onClose}>Cancel</StyledButton>
      </Actions>
    </Dialog>
  )
}

const ConfirmDelete: React.FC<Props> = ({ onConfirm, children, message, ...props }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  return (
    <>
      {showConfirmModal && (
        <ConfirmDeleteModal onConfirm={onConfirm} onClose={() => setShowConfirmModal(false)} message={message} />
      )}
      <Button $danger={true} onClick={() => setShowConfirmModal(true)} {...props}>
        {children}
      </Button>
    </>
  )
}

export default ConfirmDelete
