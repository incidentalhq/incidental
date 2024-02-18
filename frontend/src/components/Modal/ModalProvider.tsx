import { createContext, useState } from 'react'

import ModalRoot from './ModalRoot'

const modalProviderDefaultValue = () => {
  const [modal, setModal] = useState<React.ReactElement>()
  const closeModal = () => setModal(undefined)

  return {
    modal,
    setModal,
    closeModal
  }
}

type ModalProviderValue = ReturnType<typeof modalProviderDefaultValue>

export const ModalContext = createContext<undefined | ModalProviderValue>(undefined)

type Props = {
  children?: React.ReactNode
}

export const ModalProvider: React.FC<Props> = ({ children }) => {
  const value = modalProviderDefaultValue()
  const handleClickOutside = () => {
    value.closeModal()
  }

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalRoot modal={value.modal} onClickOutside={handleClickOutside} />
    </ModalContext.Provider>
  )
}

export default ModalProvider
