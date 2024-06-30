import styled from 'styled-components'

import { useModal } from '../Modal/useModal'
import { StyledButton } from '../Theme/Styles'
import Button, { ButtonProps } from './Button'

const Modal = styled.div`
  padding: 1rem;
`
const MessageEl = styled.div`
  margin-bottom: 1rem;
`
const ControlsEl = styled.div`
  > a {
    margin-left: 0.5rem;
  }
`

interface Props extends ButtonProps {
  onConfirm: () => void
  message?: string
}

const ConfirmDelete: React.FC<Props> = ({ onConfirm, children, message, ...props }) => {
  const { setModal, closeModal } = useModal()

  const handleConfirm = (evt: React.SyntheticEvent<HTMLButtonElement>) => {
    evt.preventDefault()
    closeModal()
    onConfirm()
  }

  const handleClickCancel = (evt: React.SyntheticEvent<HTMLAnchorElement>) => {
    evt.preventDefault()
    closeModal()
  }

  const onClick = (evt: React.SyntheticEvent<HTMLButtonElement>) => {
    evt.preventDefault()
    setModal(
      <Modal>
        <MessageEl>{message ? message : 'Are you sure you want to delete this?'}</MessageEl>
        <ControlsEl>
          <StyledButton onClick={handleConfirm}>Yes</StyledButton>
          <a href="#cancel" onClick={handleClickCancel}>
            Cancel
          </a>
        </ControlsEl>
      </Modal>
    )
  }

  return (
    <Button $danger={true} onClick={onClick} {...props}>
      {children}
    </Button>
  )
}

export default ConfirmDelete
