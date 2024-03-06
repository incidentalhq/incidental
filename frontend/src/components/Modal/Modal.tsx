import { motion } from 'framer-motion'
import React, { PropsWithChildren } from 'react'
import styled from 'styled-components'

const Root = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  opacity: 1;
  background: rgba(145, 145, 145, 0.6);
  z-index: 999;
`

const Content = styled.div`
  box-shadow:
    0 4px 20px 4px rgba(0, 20, 60, 0.1),
    0 4px 80px -8px rgba(0, 20, 60, 0.2);
  z-index: 9999;
  background-color: #fff;
  max-width: 1200px;
  border-radius: 1rem;

  @media screen and (max-width: 600px) {
    box-shadow: none;
    width: 100%;
    height: 100%;
    min-width: initial;
    border-radius: 0;
  }
`

const Modal = React.forwardRef<HTMLDivElement, PropsWithChildren<unknown>>((props, ref) => (
  <Root>
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
      <Content ref={ref}>{props.children}</Content>
    </motion.div>
  </Root>
))

Modal.displayName = 'Modal'

export default Modal
