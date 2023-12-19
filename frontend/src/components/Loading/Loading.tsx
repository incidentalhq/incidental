import React from 'react'

import spinner from '@/assets/icons/spinner.svg'
import Icon from '@/components/Icon/Icon'

interface Props {
  text?: string
}

const Loading: React.FC<Props> = ({ text = 'Loading...' }) => (
  <div>
    <Icon icon={spinner} spin={true} /> {text}
  </div>
)

export default Loading
