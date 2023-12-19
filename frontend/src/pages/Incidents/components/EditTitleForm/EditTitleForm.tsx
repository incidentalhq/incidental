import { createRef, KeyboardEvent, useCallback } from 'react'
import styled from 'styled-components'

import { IIncident } from '@/types/models'

const Root = styled.div`
  border: 0;
  outline: 0px solid transparent;
`

interface Props {
  incident: IIncident
  onSubmit: (values: FormValues) => void
}

export interface FormValues {
  name: string
}

const EditTitleForm: React.FC<Props> = ({ incident, onSubmit }) => {
  const ref = createRef<HTMLDivElement>()

  const saveContents = useCallback(() => {
    const contents = ref.current?.innerHTML
    onSubmit({
      name: contents ?? ''
    })
  }, [ref, onSubmit])

  const handleChange = (evt: KeyboardEvent<HTMLDivElement>) => {
    if (evt.code == 'Enter') {
      evt.preventDefault() // we don't want newlines in the title
      saveContents()
    }
  }

  const handleBlur = useCallback(() => {
    saveContents()
  }, [saveContents])

  return (
    <Root
      ref={ref}
      contentEditable
      onBlur={handleBlur}
      onKeyDown={handleChange}
      dangerouslySetInnerHTML={{ __html: incident.name }}
    ></Root>
  )
}

export default EditTitleForm
