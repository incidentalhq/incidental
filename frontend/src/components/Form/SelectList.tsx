import { ErrorMessage, useField } from 'formik'
import React from 'react'
import styled from 'styled-components'

import { StyledButton } from '../Theme/Styles'

const ItemsContainer = styled.div`
  border-radius: 0.25rem;
  border: 1px solid var(--color-gray-200);
  overflow-y: scroll;
  height: 400px;
  overflow-x: hidden;
  padding: 0.5rem;

  > div {
    margin-right: 0.5rem;
  }
`

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 0 0.5rem 0;
`
const Stats = styled.div`
  background-color: var(--color-slate-100);
  padding: 0.5rem;
`

interface SelectItemsListProps {
  items: string[]
  selected: string[]
  onSelect: (column: string) => void
  onRemove: (column: string) => void
}

const SelectedItemList: React.FC<SelectItemsListProps> = ({ items, selected, onSelect, onRemove }) => {
  return (
    <>
      {items.map((item) => (
        <ListItem key={item}>
          {selected.includes(item) ? (
            <>
              {item}{' '}
              <StyledButton type="button" onClick={() => onRemove(item)}>
                Remove
              </StyledButton>
            </>
          ) : (
            <>
              {item}{' '}
              <StyledButton type="button" onClick={() => onSelect(item)}>
                Add
              </StyledButton>
            </>
          )}
        </ListItem>
      ))}
    </>
  )
}

interface FieldProps {
  items: string[]
  name: string
}

const SelectListField: React.FC<FieldProps> = ({ items, name }) => {
  const [field, , helpers] = useField<string[]>(name)

  const handleSelect = (item: string) => {
    helpers.setValue([item, ...field.value])
  }
  const handleRemove = (item: string) => {
    helpers.setValue(field.value.filter((it) => it !== item))
  }

  return (
    <>
      <ItemsContainer>
        <SelectedItemList items={items} selected={field.value} onSelect={handleSelect} onRemove={handleRemove} />
      </ItemsContainer>
      <Stats>{field.value.length} items selected</Stats>
      <ErrorMessage name={field.name} component="div" className="error-help" />
    </>
  )
}

export default SelectListField
