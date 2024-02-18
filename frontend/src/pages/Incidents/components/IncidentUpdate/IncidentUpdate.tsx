import { IIncidentUpdate } from "@/types/models";
import styled from "styled-components";

const Root = styled.div`
  padding: 1rem 20px;
  border-top: 1px solid var(--color-gray-200);
  cursor: pointer;
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
  incidentUpdate: IIncidentUpdate;
}

const IncidentUpdate: React.FC<Props> = ({ incidentUpdate }) => {
  return (
    <Root>
      <Header>
        update
        <div>
          {incidentUpdate.newIncidentSeverity ? (
            <>
              {incidentUpdate.previousIncidentSeverity?.name} {"->"}{" "}
              {incidentUpdate.newIncidentSeverity.name}
            </>
          ) : null}
        </div>
      </Header>
    </Root>
  );
};

export default IncidentUpdate;
