import * as d3 from 'd3'
import { useMemo } from 'react'
import styled from 'styled-components'

import { ComponentStatus } from '@/types/enums'
import { IStatusPageComponentEvent } from '@/types/models'

import { Segment } from '../types'
import { calculateTimeWindowWithBuffer, groupEventsByComponent } from '../utils'
import ComponentTimeline from './ComponentTimeline'

const Root = styled.div``

const ComponentsUptimeSection = ({ events }: { events: IStatusPageComponentEvent[] }) => {
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

  const x = useMemo(() => d3.scaleUtc().domain([bufferStart, bufferEnd]).range([0, 100]), [bufferStart, bufferEnd])
  const ticks = useMemo(() => x.ticks(90), [x])
  const eventsGroupedByComponent = useMemo(() => groupEventsByComponent(events, now), [events, now])

  const timeline = useMemo(() => {
    const components: { [key: string]: Segment[] } = {}
    ticks.forEach((tick, index) => {
      const nextTick = ticks[index + 1] || now

      Object.keys(eventsGroupedByComponent).forEach((componentName) => {
        const componentEvents = eventsGroupedByComponent[componentName]
        const componentTimeline = components[componentName] || []
        const eventWithinTick = componentEvents.find((event) => event.startTime < nextTick && event.endTime > tick)
        const segment = eventWithinTick
          ? {
              status: eventWithinTick.status,
              startTime: tick,
              endTime: nextTick,
              hasEnded: eventWithinTick.hasEnded
            }
          : {
              status: ComponentStatus.OPERATIONAL,
              startTime: tick,
              endTime: nextTick,
              hasEnded: false
            }

        componentTimeline.push(segment)
        components[componentName] = componentTimeline
      })
    })

    return components
  }, [ticks, eventsGroupedByComponent, now])

  return (
    <Root>
      {Object.keys(timeline).map((componentName) => (
        <ComponentTimeline key={componentName} componentName={componentName} segments={timeline[componentName]} x={x} />
      ))}
    </Root>
  )
}

export default ComponentsUptimeSection
