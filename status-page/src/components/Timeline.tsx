import { ReactElement } from "react";
import styled from "styled-components";

const Root = styled.div`
  margin-top: 1rem;

  ul,
  li {
    list-style: none;
    padding: 0;
    margin: 0;
    padding-left: 1rem;
  }

  li {
    padding-bottom: 1.5rem;
    border-left: 1px solid var(--color-slate-200);
    position: relative;
    &:last-child {
      border: 0px;
      padding-bottom: 0;
    }
    &:before {
      content: "";
      width: 15px;
      height: 15px;
      background: white;
      border: 1px solid var(--color-slate-200);
      border-radius: 50%;
      position: absolute;
      left: -7.5px;
      top: 0px;
    }
  }
`;

interface Props<T> {
  updates: Array<T>;
  render: (props: T) => ReactElement<T>;
}

interface Update {
  id: string;
}

const Timeline = <T extends Update>({
  updates,
  render,
}: Props<T>): ReactElement => {
  return (
    <Root>
      {updates.length == 0 ? (
        <p>There are no updates.</p>
      ) : (
        <ul>
          {updates.map((item) => (
            <li key={item.id}>{render(item)}</li>
          ))}
        </ul>
      )}
    </Root>
  );
};

export default Timeline;
