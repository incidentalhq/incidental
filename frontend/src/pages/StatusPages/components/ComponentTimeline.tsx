import * as d3 from 'd3'
import { useMemo } from 'react'
import styled from 'styled-components'

import { Segment } from '../types'
import { mapComponentStatusToStyleProps } from '../utils'

interface SegmentProps {
  $left: number
  $width: number
  $backgroundColor: string
  $borderColor: string
  $removeRightRadius?: boolean
  $removeLeftRadius?: boolean
}
const TimelineSegment = styled.div<SegmentProps>`
  position: absolute;
  height: 100%;
  background-color: ${(props) => props.$backgroundColor};
  left: ${(props) => props.$left}%;
  width: ${(props) => props.$width}%;
  border: 1px solid #fff;
`
const Root = styled.div`
  margin-bottom: 1rem;

  h4 {
    margin-bottom: 0.5rem;
  }
`
const TimelineBar = styled.div`
  position: relative;
  height: 30px;
`

const CurrentTimeMarker = styled.div<{ $left: number }>`
  position: absolute;
  height: 100%;
  width: 1px;
  background-color: var(--color-gray-400);
  left: ${(props) => props.$left}%;
`

interface Props {
  componentName: string
  segments: Segment[]
  x: d3.ScaleTime<number, number>
}

const ComponentTimeline: React.FC<Props> = ({ componentName, segments, x }) => {
  const now = useMemo(() => new Date(), [])
  return (
    <Root>
      <h4>{componentName}</h4>
      <TimelineBar>
        {segments.map((segment, index) => (
          <TimelineSegment
            key={index}
            $left={x(segment.startTime)}
            $width={x(segment.endTime) - x(segment.startTime)}
            $backgroundColor={mapComponentStatusToStyleProps(segment.status).$backgroundColor}
            $borderColor={mapComponentStatusToStyleProps(segment.status).$borderColor}
          />
        ))}
        <CurrentTimeMarker $left={x(now)} />
      </TimelineBar>
    </Root>
  )
}

export default ComponentTimeline
