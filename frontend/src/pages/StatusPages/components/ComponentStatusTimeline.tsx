import * as d3 from 'd3'
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
  background-color: ${(props) => props.$backgroundColor};
  left: ${(props) => props.$left}%;
  width: ${(props) => props.$width}%;
  border: 1px solid #fff;
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
  height: 30px;
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

const ComponentStatusTimeline = ({ events }: { events: IStatusPageComponentEvent[] }) => {
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

  const x = d3.scaleUtc().domain([bufferStart, bufferEnd]).range([0, 100])
  const ticks = x.ticks(90)

  // Group by components to prepare the timeline
  const eventsGroupedByComponent = events.reduce(
    (acc, event) => {
      if (!acc[event.statusPageComponent.name]) {
        acc[event.statusPageComponent.name] = []
      }
      acc[event.statusPageComponent.name].push({
        status: event.status,
        startTime: new Date(event.startedAt),
        endTime: event.endedAt ? new Date(event.endedAt) : now,
        hasEnded: !!event.endedAt
      })
      return acc
    },
    {} as { [key: string]: Segment[] }
  )

  useEffect(() => {
    const prepareTimeline = () => {
      const components: { [key: string]: Segment[] } = {}

      ticks.forEach((tick, index) => {
        const nextTick = ticks[index + 1] || now

        Object.keys(eventsGroupedByComponent).forEach((componentName) => {
          const componentEvents = eventsGroupedByComponent[componentName]
          const componentTimeline = components[componentName] || []

          const eventWithinTick = componentEvents.find((event) => event.startTime < nextTick && event.endTime > tick)

          if (eventWithinTick) {
            const currentSegment = {
              status: eventWithinTick.status,
              startTime: tick,
              endTime: nextTick,
              hasEnded: eventWithinTick.hasEnded
            }
            componentTimeline.push(currentSegment)
          } else {
            const operationalSegment = {
              status: ComponentStatus.OPERATIONAL,
              startTime: tick,
              endTime: nextTick,
              hasEnded: false
            }
            componentTimeline.push(operationalSegment)
          }

          components[componentName] = componentTimeline
        })
      })
      console.log(components)

      setTimeline(components)
    }

    prepareTimeline()
  }, [events, earliestEventStartedAt, now])

  return (
    <Root>
      {Object.keys(timeline).map((componentName) => (
        <ComponentTimeline key={componentName}>
          <h4>{componentName}</h4>
          <TimelineBar>
            {timeline[componentName].map((segment, index) => (
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
        </ComponentTimeline>
      ))}
    </Root>
  )
}

export default ComponentStatusTimeline
