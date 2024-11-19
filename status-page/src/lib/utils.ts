import { ComponentStatus, StatusPageIncidentStatus } from "@/types/enums";

export function formatIncidentStatus(status: StatusPageIncidentStatus) {
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

export function mapComponentStatusToColor(status: ComponentStatus) {
  switch (status) {
    case ComponentStatus.OPERATIONAL:
      return "var(--color-green-100)";
    case ComponentStatus.DEGRADED_PERFORMANCE:
      return "var(--color-yellow-100)";
    case ComponentStatus.PARTIAL_OUTAGE:
      return "var(--color-orange-100)";
    case ComponentStatus.FULL_OUTAGE:
      return "var(--color-red-100)";
  }
}
