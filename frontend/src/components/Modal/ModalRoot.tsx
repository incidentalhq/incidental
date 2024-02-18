import { createRef } from 'react'
import { createPortal } from 'react-dom'

import Modal from './Modal'
import { useOnClickOutside } from './useModal'

interface Props {
  modal?: React.ReactElement
  onClickOutside: () => void
}

export const ModalRoot: React.FC<Props> = ({ modal, onClickOutside }) => {
  //const ref = React.useRef<HTMLDivElement>()
  const ref = createRef<HTMLDivElement>()

  useOnClickOutside(ref, onClickOutside)

  if (!modal) {
    return null
  }

  return createPortal(<Modal ref={ref}>{modal}</Modal>, document.body)
}

export default ModalRoot
