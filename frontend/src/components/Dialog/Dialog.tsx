import { motion } from 'framer-motion'
import React, { PropsWithChildren, useRef } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

import { useOnClickOutside } from '../Modal/useModal'
import DialogHeader from './Header'

const Root = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  display: flex;
  justify-content: center;
  top: 0;
  left: 0;
  opacity: 1;
  background: rgba(145, 145, 145, 0.6);
  z-index: 999;
`

const Wrapper = styled.div`
  box-shadow:
    0 4px 20px 4px rgba(0, 20, 60, 0.1),
    0 4px 80px -8px rgba(0, 20, 60, 0.2);
  z-index: 9999;
  background-color: #fff;
  max-width: 1200px;
  border-radius: 1rem;
  margin-top: 10vh;

  @media screen and (max-width: 600px) {
    box-shadow: none;
    width: 100%;
    height: 100%;
    min-width: initial;
    border-radius: 0;
  }
`

const DialogContent = styled.div`
  padding: 1rem;
`

interface Props {
  title: string
  onClose: () => void
}

const Dialog: React.FC<PropsWithChildren<Props>> = ({ onClose, children, title }) => {
  const ref = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useOnClickOutside(ref, onClose)

  return createPortal(
    <Root ref={rootRef}>
      <motion.div
        initial={{
          opacity: 0,
          y: 15
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.8,
          ease: [0, 0.71, 0.2, 1.01]
        }}
      >
        <Wrapper ref={ref}>
          <DialogHeader onClose={onClose} title={title} />
          <DialogContent>{children}</DialogContent>
        </Wrapper>
      </motion.div>
    </Root>,
    document.body
  )
}

export default Dialog
