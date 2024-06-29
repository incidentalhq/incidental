import { createRef, KeyboardEvent, useCallback, useState } from 'react'
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
  const [lastGoodContentState, setLastGoodContentState] = useState(incident.name)

  const saveContents = useCallback(() => {
    const contents = ref.current?.innerHTML

    // don't allow title to be empty
    if (!contents || contents.trim() === '') {
      // restore last good state
      ref.current?.append(lastGoodContentState)
      return
    }

    onSubmit({
      name: contents
    })
    setLastGoodContentState(contents)
  }, [ref, onSubmit, setLastGoodContentState, lastGoodContentState])

  const handleChange = (evt: KeyboardEvent<HTMLDivElement>) => {
    if (evt.code == 'Enter') {
      evt.preventDefault() // we don't want newlines in the title
      saveContents()
      ref.current?.blur()
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
      dangerouslySetInnerHTML={{ __html: lastGoodContentState }}
    ></Root>
  )
}

export default EditTitleForm
