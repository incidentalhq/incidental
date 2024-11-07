import { FieldAttributes } from 'formik'
import React from 'react'
import styled from 'styled-components'

import Field from '@/components/Form/Field'

const InputGroup = styled.div`
  display: flex;
  align-items: center;
`

const Prefix = styled.span`
  padding: 8px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
  color: #888;
`

const SuffixInput = styled(Field)`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-left: none;
  border-radius: 0 4px 4px 0;
  outline: none;
  width: 200px;
`

interface Props {
  prefix: string
}

const FieldWithPrefix: React.FC<Props & FieldAttributes<unknown>> = ({ prefix, ...props }) => {
  return (
    <InputGroup>
      <Prefix>{prefix}</Prefix>
      <SuffixInput placeholder="your-status-page-path" {...props} />
    </InputGroup>
  )
}

export default FieldWithPrefix
