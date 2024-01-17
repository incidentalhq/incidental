import { format } from "date-fns";
import { IInvite } from "shared-types/types";
import styled from "styled-components";
import { Button } from "ui/components/Theme/Styles";

const Root = styled.div`
  padding: 1rem;
  border: 1px solid var(--color-gray-100);
  border-top: 0;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
`;

interface CellProps {
  right?: boolean;
}
const Cell = styled.div<CellProps>`
  text-align: ${(props) => (props.right ? "right" : "left")};
`;

export interface Props {
  invite: IInvite;
  onDelete: (invite: IInvite) => void;
}

const SentInvite: React.FC<Props> = ({ invite, onDelete }) => {
  const sentAt = new Date(invite.createdAt);
  const formatting = "do MMMM yyyy";
  const sentAtF = format(sentAt, formatting);

  return (
    <Root>
      <Cell>{invite.emailAddress}</Cell>
      <Cell>{"Pending"}</Cell>
      <Cell>{sentAtF}</Cell>
      <Cell right={true}>
        <Button danger={true} onClick={() => onDelete(invite)}>
          Delete
        </Button>
      </Cell>
    </Root>
  );
};

export default SentInvite;
