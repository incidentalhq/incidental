import React, { useCallback } from 'react'
import styled from 'styled-components'

import { FieldInterfaceKind } from '@/types/enums'
import { IField, IIncidentFieldValue } from '@/types/models'

const Root = styled.div``

const TagList = styled.div`
  display: flex;
  gap: 8px;
`
const Tag = styled.div`
  cursor: pointer;
  background-color: var(--color-gray-100);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-md);

  &:hover {
    background-color: var(--color-gray-200);
  }
`

interface Props {
  field: IField
  incidentFieldValue: IIncidentFieldValue
  onClick: (field: IField) => void
}

const DisplayFieldValue: React.FC<Props> = ({ field, incidentFieldValue, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(field)
  }, [onClick, field])

  if (field.interfaceKind === FieldInterfaceKind.MULTI_SELECT) {
    return (
      <TagList>
        {incidentFieldValue.valueMultiSelect.map((it) => (
          <Tag key={it} onClick={handleClick}>
            {it}
          </Tag>
        ))}
      </TagList>
    )
  }

  if (field.interfaceKind === FieldInterfaceKind.TEXT || field.interfaceKind === FieldInterfaceKind.TEXTAREA) {
    return <Tag onClick={handleClick}>{incidentFieldValue.valueText}</Tag>
  }

  if (field.interfaceKind === FieldInterfaceKind.SINGLE_SELECT) {
    return <Tag onClick={handleClick}>{incidentFieldValue.valueSingleSelect}</Tag>
  }
}

export default DisplayFieldValue
