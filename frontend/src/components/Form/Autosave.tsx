import { useFormikContext } from 'formik'
import _ from 'lodash'
import { useCallback, useEffect, useState } from 'react'

import spinner from '@/assets/icons/spinner.svg'
import Icon from '@/components/Icon/Icon'
import { StyledButton } from '@/components/Theme/Styles'

interface Props {
  debounceMs?: number
  button?: boolean
  feedback?: boolean
}

const AutoSave: React.FC<Props> = ({ debounceMs = 3000, button = false, feedback = false }) => {
  const formik = useFormikContext()
  const [isSaved, setIsSaved] = useState<boolean>(false)
  const [label, setLabel] = useState<React.ReactElement | string>('Save')

  const debouncedSubmit = useCallback(
    _.debounce(() => {
      return formik.submitForm().then(() => setIsSaved(true))
    }, debounceMs),
    [formik.submitForm, debounceMs]
  )

  useEffect(() => {
    if (formik.isValid && formik.dirty && !formik.isSubmitting) {
      debouncedSubmit()
    }
  }, [debouncedSubmit, formik.values])

  useEffect(() => {
    if (formik.isSubmitting) {
      setLabel(
        <>
          <Icon icon={spinner} spin={true} /> Auto saving...
        </>
      )
    } else {
      if (!formik.dirty) {
        setLabel('Latest changes saved')
      } else {
        setLabel('Save')
      }
    }
  }, [formik.isSubmitting, formik.dirty])

  const handleSubmit = () => {
    debouncedSubmit.cancel()
    formik.submitForm().then(() => setIsSaved(true))
  }

  return (
    <div>
      {button && (
        <div>
          <StyledButton type="button" disabled={formik.isSubmitting || !formik.dirty} onClick={handleSubmit}>
            {label}
          </StyledButton>
        </div>
      )}
      {feedback && <div>{formik.isSubmitting ? 'Saving...' : isSaved ? 'Changes saved.' : null}</div>}
    </div>
  )
}

export default AutoSave
