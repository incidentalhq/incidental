import styled from 'styled-components'

import { IIncidentUpdate } from '@/types/models'

import IncidentUpdate from './IncidentUpdate'

const Root = styled.div`
  margin-top: 1rem;

  ul,
  li {
    list-style: none;
    padding: 0;
    margin: 0;
    padding-left: 1rem;
  }

  li {
    padding-bottom: 1.5rem;
    border-left: 1px solid #abaaed;
    position: relative;
    &:last-child {
      border: 0px;
      padding-bottom: 0;
    }
    &:before {
      content: '';
      width: 15px;
      height: 15px;
      background: white;
      border: 1px solid #4e5ed3;
      border-radius: 50%;
      position: absolute;
      left: -7.5px;
      top: 0px;
    }
  }
`

interface Props {
  updates: Array<IIncidentUpdate>
}

const Timeline: React.FC<Props> = ({ updates }) => {
  return (
    <Root>
      {updates.length == 0 ? (
        <p>There are no updates.</p>
      ) : (
        <ul>
          {updates.map((item) => (
            <li key={item.id}>
              <IncidentUpdate key={item.id} incidentUpdate={item} />
            </li>
          ))}
        </ul>
      )}
    </Root>
  )
}

export default Timeline
