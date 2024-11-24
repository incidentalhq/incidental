import { generatePath, Link, PathParam, useMatch } from 'react-router-dom'
import styled, { css } from 'styled-components'

import useGlobal from '@/hooks/useGlobal'
import { RoutePaths } from '@/routes'

interface ItemProps {
  $selected?: boolean
}

const onSelectItem = css`
  background-color: var(--color-gray-100);
`

const MenuLink = styled(Link)<ItemProps>`
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0.25rem 8px;
  border-radius: 0.4rem;
  margin-bottom: 1px;
  gap: 1rem;

  &:hover {
    background-color: var(--color-gray-100);
  }

  ${(props) => props.$selected && onSelectItem}
`

export const MenuItemRoot = styled.div``

interface MenuItemProps<T extends RoutePaths> {
  to: T
  pathParams?: {
    [K in PathParam<T>]: string
  } & { organisation?: string }
}

function MenuItem<T extends RoutePaths>({ to, children, pathParams }: React.PropsWithChildren<MenuItemProps<T>>) {
  const match = useMatch(to)
  const { organisation } = useGlobal()

  // This should not happen
  if (!organisation) {
    return null
  }

  const params = {
    ...(pathParams || {}),
    organisation: organisation.slug
  } as { [key in PathParam<T>]: string | null }

  return (
    <MenuItemRoot>
      <MenuLink to={generatePath(to, params)} $selected={match ? true : false}>
        {children}
      </MenuLink>
    </MenuItemRoot>
  )
}

export default MenuItem
