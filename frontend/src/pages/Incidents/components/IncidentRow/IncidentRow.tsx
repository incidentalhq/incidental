import { IncidentRoleKind } from "@/types/enums";
import { IIncident } from "@/types/models";
import styled from "styled-components";

const Root = styled.div`
  padding: 1rem 20px;
  border-top: 1px solid var(--color-gray-200);
`;
const Header = styled.div`
  display: flex;
  gap: 8px;
`;
const Reference = styled.div`
  font-weight: 600;
  width: 80px;
`;
const Name = styled.div``;
const Status = styled.div`
  width: 80px;
`;
const Severity = styled.div`
  width: 80px;
`;
const Reporter = styled.div`
  margin-left: auto;
`;

interface Props {
  incident: IIncident;
}

const IncidentRow: React.FC<Props> = ({ incident }) => {
  return (
    <Root>
      <Header>
        <Reference>{incident.reference}</Reference>
        <Status>{incident.incidentStatus.name}</Status>
        <Severity>{incident.incidentSeverity.name}</Severity>
        <Name>{incident.name}</Name>
        <Reporter>
          {
            incident.incidentRoleAssignments.find(
              (it) => it.incidentRole.kind === IncidentRoleKind.REPORTER
            )?.user.name
          }
        </Reporter>
      </Header>
    </Root>
  );
};

export default IncidentRow;
