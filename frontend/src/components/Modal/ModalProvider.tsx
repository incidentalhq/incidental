import { createContext, useState } from 'react'

import ModalRoot from './ModalRoot'

const useModalProviderDefaultValue = () => {
  const [modal, setModal] = useState<React.ReactElement>()
  const closeModal = () => setModal(undefined)

  return {
    modal,
    setModal,
    closeModal
  }
}

type ModalProviderValue = ReturnType<typeof useModalProviderDefaultValue>

export const ModalContext = createContext<undefined | ModalProviderValue>(undefined)

type Props = {
  children?: React.ReactNode
}

export const ModalProvider: React.FC<Props> = ({ children }) => {
  const value = useModalProviderDefaultValue()
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
