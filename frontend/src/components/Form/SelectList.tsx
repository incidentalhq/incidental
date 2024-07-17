import { ErrorMessage, useField } from 'formik'
import React from 'react'
import styled from 'styled-components'

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

interface SwitchProps {
  $checked: boolean
}

const SwitchSpanContainer = styled.label<SwitchProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  width: 50px;
  height: 16px;
  background: ${(props) => (props.$checked ? 'var(--color-green-500)' : 'var(--color-gray-300)')};
  border-radius: 50px;
  position: relative;
  transition: background-color 0.2s;
`

const SwitchSpan = styled.span<SwitchProps>`
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 24px;
  transition: 0.2s;
  background: #fff;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-gray-400);

  ${(props) => (props.$checked ? `right: 24px; transform: translateX(100%);` : `left: 0;`)}
`

export type Item = {
  id: string
  label: string
}

interface SelectListItemProps {
  availableItems: Item[]
  selectedItems: Item[]
  onSelect: (column: Item) => void
  onRemove: (column: Item) => void
}

const SelectList: React.FC<SelectListItemProps> = ({
  availableItems: items,
  selectedItems: selected,
  onSelect,
  onRemove
}) => {
  return (
    <>
      {items.map((item) => {
        const isSelected = selected.find((it) => it.id === item.id) ? true : false
        return (
          <>
            <ListItem key={item.id}>
              {item.label}
              <SwitchSpanContainer $checked={isSelected} onClick={() => (isSelected ? onRemove(item) : onSelect(item))}>
                <SwitchSpan $checked={isSelected} />
              </SwitchSpanContainer>
            </ListItem>
          </>
        )
      })}
    </>
  )
}

interface FieldProps {
  items: Item[]
  name: string
}

const SelectListField: React.FC<FieldProps> = ({ items, name }) => {
  const [field, , helpers] = useField<Item[]>(name)

  const handleSelect = (item: Item) => {
    helpers.setValue([item, ...field.value])
  }
  const handleRemove = (item: Item) => {
    helpers.setValue(field.value.filter((it) => it.id !== item.id))
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
      <Stats>{field.value.length} items selected</Stats>
      <ErrorMessage name={field.name} component="div" className="error-help" />
    </>
  )
}

export default SelectListField
