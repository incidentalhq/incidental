import { FieldArrayRenderProps, useField } from 'formik'
import React from 'react'
import styled from 'styled-components'

import Field from '@/components/Form/Field'

const Root = styled.div`
  border: 1px solid var(--color-gray-100);
`
const Header = styled.div`
  display: grid;
  column-gap: 1rem;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0.5rem 1rem;
  background-color: var(--color-gray-100);
`
const Row = styled.div`
  width: 100%;
  display: grid;
  column-gap: 1rem;
  grid-template-columns: 2fr 2fr 1fr;
  padding: 0.5rem 1rem;
  align-items: center;

  select,
  input {
    width: 100%;
  }
`
const Delete = styled.a`
  color: var(--color-red-400);
`
const Add = styled.div`
  width: 100%;
  padding: 0.5rem 1rem;
`

interface CellProps {
  right?: boolean
}
const Actions = styled.div<CellProps>`
  text-align: ${(props) => (props.right ? 'right' : 'left')};

  > a {
    display: inline-block;
    margin-right: 0.5rem;
    vertical-align: middle;
  }
`

type Props = FieldArrayRenderProps & {
  placeholder: string
}

const OptionsArrayField: React.FC<Props> = (props) => {
  const [field] = useField<Array<string>>(props.name)

  return (
    <Root>
      <Header>
        <div>Option name</div>
        <div></div>
      </Header>
      {field.value.map((_, index: number) => {
        return (
          <Row key={index}>
            <div>
              <Field type="text" name={`${field.name}.${index}`} placeholder={props.placeholder} />
            </div>
            <Actions>
              <Delete href="#delete" onClick={props.handleRemove(index)}>
                Delete
              </Delete>
            </Actions>
          </Row>
        )
      })}
      <Add>
        <a href="#Add" onClick={props.handlePush('')}>
          Add option
        </a>
      </Add>
    </Root>
  )
}

export default OptionsArrayField
