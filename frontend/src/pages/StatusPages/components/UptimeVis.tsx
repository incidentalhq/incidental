import { useEffect, useMemo, useState } from 'react'

import { ComponentStatus } from '@/types/enums'
import { IStatusPageComponentEvent } from '@/types/models'

const StatusTimeline = ({ events }: { events: IStatusPageComponentEvent[] }) => {
  const [timeline, setTimeline] = useState<{
    [key: string]: { status: ComponentStatus; startTime: Date; endTime: Date }[]
  }>({})
  const now = useMemo(() => new Date(), [])

  // earliest event startedAt to consider for the timeline
  const earliestEventStartedAt = useMemo(
    () =>
      events.reduce((earliest, event) => {
        const startedAt = new Date(event.startedAt)
        return startedAt < earliest ? startedAt : earliest
      }, now),
    [events, now]
  )

  useEffect(() => {
    // Prepare the timeline for the last 30 days
    const prepareTimeline = () => {
      const components: { [key: string]: { status: ComponentStatus; startTime: Date; endTime: Date }[] } = {}

      events.forEach((event) => {
        const { name } = event.statusPageComponent
        const startedAt = new Date(event.startedAt)
        const endedAt = event.endedAt ? new Date(event.endedAt) : now

        if (!components[name]) components[name] = []

        if (endedAt > earliestEventStartedAt) {
          components[name].push({
            status: event.status,
            startTime: new Date(Math.max(startedAt.getTime(), earliestEventStartedAt.getTime())),
            endTime: endedAt
          })
        }
      })

      // Sort the events for each component
      Object.keys(components).forEach((componentName) => {
        components[componentName] = components[componentName].sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
      })

      setTimeline(components)
    }

    prepareTimeline()
  }, [events, earliestEventStartedAt, now])

  const getStatusColor = (status: ComponentStatus) => {
    switch (status) {
      case 'FULL_OUTAGE':
        return 'red'
      case 'PARTIAL_OUTAGE':
        return 'orange'
      case 'DEGRADED_PERFORMANCE':
        return 'yellow'
      case 'OPERATIONAL':
        return 'green'
      default:
        return 'gray'
    }
  }

  return (
    <div>
      {Object.keys(timeline).map((componentName) => (
        <div key={componentName}>
          <h3>{componentName}</h3>
          <div
            style={{
              display: 'flex',
              position: 'relative',
              height: '20px',
              border: '1px solid #ccc',
              marginBottom: '10px',
              width: '100%'
            }}
          >
            {timeline[componentName].map((segment, index) => {
              const totalDuration = now.getTime() - earliestEventStartedAt.getTime()
              const startPercent =
                ((segment.startTime.getTime() - earliestEventStartedAt.getTime()) / totalDuration) * 100
              const durationPercent = ((segment.endTime.getTime() - segment.startTime.getTime()) / totalDuration) * 100

              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: getStatusColor(segment.status),
                    position: 'absolute',
                    left: `${startPercent}%`,
                    width: `${durationPercent}%`,
                    height: '100%'
                  }}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

const UptimeVisualization = ({ events }: { events: IStatusPageComponentEvent[] }) => {
  return (
    <div>
      <StatusTimeline events={events} />
    </div>
  )
}

export default UptimeVisualization
