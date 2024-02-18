import { motion } from 'framer-motion'
import { ReactElement, useCallback, useRef, useState } from 'react'
import styled from 'styled-components'

import useOnClickOutside from '@/hooks/useOnClickOutside'

const Root = styled.div`
  position: relative;

  a {
    color: var(--color-gray-600);
    text-decoration: none;
  }
`
const Menu = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  margin: 0.125rem 0 0;
  background-color: #fff;
  background-clip: padding-box;
  box-shadow: var(--shadow);
  border-radius: 0.4rem;
  min-width: 120px;
`

interface Props {
  children?: React.ReactNode
  label: string | ReactElement
  closeOnClick: boolean
}

const variants = {
  closed: {
    y: '10px',
    opacity: 0
  },
  open: {
    y: '0px',
    opacity: 1
  }
}

const Dropdown: React.FC<Props> = ({ label, children, closeOnClick }) => {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  const handleClickMenuButton = useCallback(
    (evt: React.SyntheticEvent<HTMLAnchorElement>) => {
      evt.preventDefault()
      if (open) {
        return
      }

      setOpen(true)
    },
    [open]
  )

  useOnClickOutside(menuRef, () => open && setOpen(false))

  const handleOnClick = (evt: React.MouseEvent<HTMLElement>) => {
    if ((evt.target as HTMLElement).tagName === 'A') {
      setOpen(false)
    }
  }

  return (
    <Root ref={menuRef}>
      <a href="#menu" ref={buttonRef} onClick={handleClickMenuButton}>
        {label}
      </a>
      {open ? (
        <div onClick={handleOnClick}>
          <Menu initial="closed" variants={variants} animate={open ? 'open' : 'closed'}>
            {children}
          </Menu>
        </div>
      ) : null}
    </Root>
  )
}

export default Dropdown
