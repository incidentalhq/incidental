import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ComponentStatus } from '@/types/enums'
import { IStatusPageComponentEvent } from '@/types/models'

import { calculateTimeWindowWithBuffer, mapComponentStatusToStyleProps } from '../utils'

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
  border-style: solid;
  border-color: ${(props) => props.$borderColor};
  background-color: ${(props) => props.$backgroundColor};
  left: ${(props) => props.$left}%;
  width: ${(props) => props.$width}%;
  border-radius: var(--radius-lg);
  ${(props) =>
    props.$removeRightRadius &&
    'border-top-right-radius: 0; border-bottom-right-radius: 0; border-right: 1px solid transparent;'}

  ${(props) =>
    props.$removeLeftRadius &&
    'border-top-left-radius: 0; border-bottom-left-radius: 0; border-left: 1px solid transparent;'}
`
const Root = styled.div``
const ComponentTimeline = styled.div`
  margin-bottom: 1rem;

  h4 {
    margin-bottom: 0.5rem;
  }
`
const TimelineBar = styled.div`
  position: relative;
  height: 20px;
`

const CurrentTimeMarker = styled.div<{ $left: number }>`
  position: absolute;
  height: 100%;
  width: 1px;
  background-color: var(--color-gray-400);
  left: ${(props) => props.$left}%;
`
interface Segment {
  status: ComponentStatus
  startTime: Date
  endTime: Date
  hasEnded: boolean
}

const consolidateSegments = (segments: Segment[]) => {
  const consolidated: typeof segments = []
  segments.forEach((segment) => {
    if (
      consolidated.length > 0 &&
      consolidated[consolidated.length - 1].status === segment.status &&
      consolidated[consolidated.length - 1].endTime >= segment.startTime
    ) {
      consolidated[consolidated.length - 1].endTime = segment.endTime
    } else {
      consolidated.push(segment)
    }
  })
  return consolidated
}

const StatusTimeline = ({ events }: { events: IStatusPageComponentEvent[] }) => {
  const [timeline, setTimeline] = useState<{
    [key: string]: Segment[]
  }>({})
  const now = useMemo(() => new Date(), [])
  const earliestEventStartedAt = useMemo(
    () =>
      events.reduce((earliest, event) => {
        const startedAt = new Date(event.startedAt)
        return startedAt < earliest ? startedAt : earliest
      }, now),
    [events, now]
  )
  const [bufferStart, bufferEnd] = useMemo(
    () => calculateTimeWindowWithBuffer(earliestEventStartedAt, now),
    [earliestEventStartedAt, now]
  )

  useEffect(() => {
    const prepareTimeline = () => {
      const components: { [key: string]: Segment[] } = {}

      events.forEach((event) => {
        const { name } = event.statusPageComponent
        const startedAt = new Date(event.startedAt)
        const endedAt = event.endedAt ? new Date(event.endedAt) : now
        const hasEnded = event.endedAt !== null

        if (!components[name]) components[name] = []

        if (endedAt > earliestEventStartedAt) {
          components[name].push({
            status: event.status,
            startTime: new Date(Math.max(startedAt.getTime(), earliestEventStartedAt.getTime())),
            endTime: endedAt,
            hasEnded: hasEnded
          })
        }
      })

      Object.keys(components).forEach((componentName) => {
        components[componentName] = consolidateSegments(
          components[componentName].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
        )
      })

      setTimeline(components)
    }

    prepareTimeline()
  }, [events, earliestEventStartedAt, now])

  const totalDuration = bufferEnd.getTime() - bufferStart.getTime()

  return (
    <Root>
      {Object.keys(timeline).map((componentName) => (
        <ComponentTimeline key={componentName}>
          <h4>{componentName}</h4>
          <TimelineBar>
            <StartBufferTimelineSegment
              firstSegmentStartTime={timeline[componentName][0].startTime}
              bufferStartTime={bufferStart}
              totalDuration={totalDuration}
            />
            {timeline[componentName].map((segment, index, allSegments) => {
              const startPercent = ((segment.startTime.getTime() - bufferStart.getTime()) / totalDuration) * 100
              const durationPercent = ((segment.endTime.getTime() - segment.startTime.getTime()) / totalDuration) * 100
              const styles = mapComponentStatusToStyleProps(segment.status)
              const isLast = index === allSegments.length - 1

              return (
                <TimelineSegment
                  key={index}
                  title={`${segment.status}: ${segment.startTime.toISOString()} - ${segment.endTime.toISOString()}`}
                  $left={startPercent}
                  $width={durationPercent}
                  $backgroundColor={styles.$backgroundColor}
                  $borderColor={styles.$borderColor}
                  $removeRightRadius={isLast && !segment.hasEnded}
                />
              )
            })}
            <EndBufferTimelineSegment
              lastSegment={timeline[componentName][timeline[componentName].length - 1]}
              bufferEndTime={bufferEnd}
              totalDuration={totalDuration}
            />
            <CurrentTimeMarker $left={((now.getTime() - bufferStart.getTime()) / totalDuration) * 100} />
          </TimelineBar>
        </ComponentTimeline>
      ))}
    </Root>
  )
}

const StartBufferTimelineSegment = ({
  bufferStartTime,
  totalDuration,
  firstSegmentStartTime
}: {
  totalDuration: number
  firstSegmentStartTime: Date
  bufferStartTime: Date
}) => {
  const durationPercent = ((firstSegmentStartTime.getTime() - bufferStartTime.getTime()) / totalDuration) * 100
  return (
    <TimelineSegment
      key="start"
      title="Start buffer"
      $left={0}
      $width={durationPercent}
      $backgroundColor="var(--color-green-100)"
      $borderColor="var(--color-green-300)"
    />
  )
}

const EndBufferTimelineSegment = ({
  bufferEndTime,
  totalDuration,
  lastSegment
}: {
  totalDuration: number
  bufferEndTime: Date
  lastSegment: Segment
}) => {
  const durationPercent = ((bufferEndTime.getTime() - lastSegment.endTime.getTime()) / totalDuration) * 100
  const status = !lastSegment.hasEnded ? lastSegment.status : ComponentStatus.OPERATIONAL
  const styles = mapComponentStatusToStyleProps(status)
  return (
    <TimelineSegment
      key="end"
      title="End buffer"
      $left={100 - durationPercent}
      $width={durationPercent}
      $backgroundColor={styles.$backgroundColor}
      $borderColor={styles.$borderColor}
      $removeLeftRadius={status === lastSegment.status}
    />
  )
}

export default StatusTimeline
