import { ErrorMessage, useField } from 'formik'
import React from 'react'
import styled from 'styled-components'

import CheckboxToggle from './CheckboxToggle'

// Types
export type OptionItem = {
  value: string
  label: string
}

interface SelectListItemProps {
  availableItems: OptionItem[]
  selectedItems: OptionItem[]
  onSelect: (item: OptionItem) => void
  onRemove: (item: OptionItem) => void
}

interface FieldProps {
  items: OptionItem[]
  name: string
}

// Styled components
const ItemsContainer = styled.div`
  border-radius: 0.25rem;
  border: 1px solid var(--color-gray-200);
  overflow-x: hidden;
`

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-gray-100);
  }
`

const Stats = styled.div`
  background-color: var(--color-slate-100);
  padding: 0.5rem;
  margin-top: 0.5rem;
  border-radius: 0.25rem;
`

// Components
const SelectList: React.FC<SelectListItemProps> = ({ availableItems, selectedItems, onSelect, onRemove }) => (
  <>
    {availableItems.map((item) => {
      const isSelected = selectedItems.some((it) => it.value === item.value)
      return (
        <ListItem key={item.value}>
          {item.label}
          <CheckboxToggle isSelected={isSelected} onClick={() => (isSelected ? onRemove(item) : onSelect(item))} />
        </ListItem>
      )
    })}
  </>
)

const SelectListField: React.FC<FieldProps> = ({ items, name }) => {
  const [field, , helpers] = useField<OptionItem[]>(name)

  const handleSelect = (item: OptionItem) => {
    helpers.setValue([...field.value, item])
  }

  const handleRemove = (item: OptionItem) => {
    helpers.setValue(field.value.filter((it) => it.value !== item.value))
  }

  return (
    <>
      <ItemsContainer>
        <SelectList
          availableItems={items}
          selectedItems={field.value}
          onSelect={handleSelect}
          onRemove={handleRemove}
        />
      </ItemsContainer>
      <Stats>
        {field.value.length} item{field.value.length !== 1 ? 's' : ''} selected
      </Stats>
      <ErrorMessage name={field.name} component="div" className="error-help" />
    </>
  )
}

export default SelectListField
