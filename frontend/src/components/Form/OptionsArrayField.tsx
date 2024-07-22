import { FieldArrayRenderProps, useField } from 'formik'
import React from 'react'
import styled from 'styled-components'

import trash from '@/assets/icons/trash.svg'
import Field from '@/components/Form/Field'

import Button from '../Button/Button'
import Icon from '../Icon/Icon'

const Root = styled.div``
const Row = styled.div`
  width: 100%;
  display: grid;
  column-gap: 1rem;
  grid-template-columns: 2fr 2fr 1fr;
  padding: 0.5rem 0rem;
  align-items: center;

  select,
  input {
    width: 100%;
  }
`
const Add = styled.div`
  width: 100%;
  padding: 0.5rem 0rem;
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
      {field.value.map((_, index: number) => {
        return (
          <Row key={index}>
            <div>
              <Field type="text" name={`${field.name}.${index}`} placeholder={props.placeholder} />
            </div>
            <Actions>
              <Button $danger={true} onClick={props.handleRemove(index)}>
                <Icon icon={trash} />
              </Button>
            </Actions>
          </Row>
        )
      })}
      <Add>
        <Button onClick={props.handlePush('')}>Add option</Button>
      </Add>
    </Root>
  )
}

export default OptionsArrayField
