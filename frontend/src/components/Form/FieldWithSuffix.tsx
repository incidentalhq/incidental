import { ErrorMessage, Field, FieldAttributes } from 'formik'
import React from 'react'
import styled from 'styled-components'

const InputGroup = styled.div`
  display: flex;
  align-items: center;
`

const Suffix = styled.span`
  padding: 8px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 0 4px 4px 0;
  color: #888;
`

const InputWrapper = styled(Field)`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-right: none;
  border-radius: 4px 0 0 4px;
  outline: none;
`

interface Props {
  suffix: string
}

const FieldWithSuffix: React.FC<Props & FieldAttributes<unknown>> = ({ suffix: prefix, ...props }) => {
  return (
    <>
      <InputGroup>
        <InputWrapper {...props} />
        <Suffix>{prefix}</Suffix>
      </InputGroup>
      <ErrorMessage name={props.name} component="div" className="error-help" />
    </>
  )
}

export default FieldWithSuffix
