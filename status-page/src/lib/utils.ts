import { ComponentStatus, StatusPageIncidentStatus } from "@/types/enums";
import { IStatusPageComponentEvent } from "@/types/models";
import { CSSProperties } from "react";

export function formatIncidentStatusName(status: StatusPageIncidentStatus) {
  switch (status) {
    case StatusPageIncidentStatus.INVESTIGATING:
      return "Investigating";
    case StatusPageIncidentStatus.IDENTIFIED:
      return "Identified";
    case StatusPageIncidentStatus.MONITORING:
      return "Monitoring";
    case StatusPageIncidentStatus.RESOLVED:
      return "Resolved";
  }
}

export function formatComponentStatusName(status: ComponentStatus) {
  switch (status) {
    case ComponentStatus.OPERATIONAL:
      return "Operational";
    case ComponentStatus.DEGRADED_PERFORMANCE:
      return "Degraded Performance";
    case ComponentStatus.PARTIAL_OUTAGE:
      return "Partial Outage";
    case ComponentStatus.FULL_OUTAGE:
      return "Full Outage";
  }
}

export const getComponentStatusRank = (status: ComponentStatus) => {
  switch (status) {
    case ComponentStatus.OPERATIONAL:
      return 0;
    case ComponentStatus.DEGRADED_PERFORMANCE:
      return 1;
    case ComponentStatus.PARTIAL_OUTAGE:
      return 2;
    case ComponentStatus.FULL_OUTAGE:
      return 3;
  }
};

export const getComponentStatusStyle = (
  status: ComponentStatus
): CSSProperties => {
  switch (status) {
    case ComponentStatus.OPERATIONAL:
      return {
        backgroundColor: "var(--color-green-400)",
        color: "var(--color-green-100)",
      };
    case ComponentStatus.DEGRADED_PERFORMANCE:
      return {
        backgroundColor: "var(--color-yellow-400)",
        color: "var(--color-yellow-100)",
      };
    case ComponentStatus.PARTIAL_OUTAGE:
      return {
        backgroundColor: "var(--color-orange-400)",
        color: "var(--color-orange-100)",
      };
    case ComponentStatus.FULL_OUTAGE:
      return {
        backgroundColor: "var(--color-red-400)",
        color: "var(--color-red-100)",
      };
  }
};

export const getMostSevereEvent = (events: IStatusPageComponentEvent[]) => {
  const mostSevereEvent =
    events.length > 1
      ? events.reduce(
          (
            prev: IStatusPageComponentEvent,
            current: IStatusPageComponentEvent
          ) => {
            const prevRank = getComponentStatusRank(prev.status);
            const currentRank = getComponentStatusRank(current.status);
            return currentRank > prevRank ? current : prev;
          },
          events[0]
        )
      : events[0];

  return mostSevereEvent;
};
