import styled from "styled-components";
import type { IStatusPageResponse } from "@/types/models";
import ComponentStatus from "./ComponentStatus";

const Root = styled.div`
  border: 1px solid var(--color-slate-200);
  border-radius: var(--radius-md);
`;
const GroupName = styled.div`
  font-weight: 600;
  margin-bottom: 1rem;
`;
const Item = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--color-slate-200);
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;
const ItemGroup = styled.div`
  padding: 1rem;

  ${Item} {
    border-bottom: none;
    padding: 0;
  }
`;
const Count = styled.span`
  color: var(--color-gray-500);
  font-size: 0.9rem;
  font-weight: 400;
  margin-left: 0.5rem;
`;

interface Props {
  statusPageResponse: IStatusPageResponse;
  start: Date;
  end: Date;
}
const SystemStatus: React.FC<Props> = ({ statusPageResponse, start, end }) => {
  return (
    <Root>
      {statusPageResponse.statusPage.statusPageItems.map((item) => {
        return (
          <div key={item.id}>
            {item.statusPageComponent && (
              <Item>
                <ComponentStatus
                  beginAt={new Date(statusPageResponse.statusPage.publishedAt)}
                  component={item.statusPageComponent}
                  uptimes={statusPageResponse.uptimes}
                  events={statusPageResponse.events.filter(
                    (it) =>
                      it.statusPageComponent.id === item.statusPageComponent?.id
                  )}
                  start={start}
                  end={end}
                />
              </Item>
            )}

            {item.statusPageComponentGroup && (
              <ItemGroup>
                <GroupName>
                  <span>{item.statusPageComponentGroup.name}</span>
                  <Count>({item.statusPageItems?.length})</Count>
                </GroupName>
                {item.statusPageItems?.map((subItem) => (
                  <Item key={subItem.id}>
                    {subItem.statusPageComponent && (
                      <ComponentStatus
                        beginAt={
                          new Date(statusPageResponse.statusPage.publishedAt)
                        }
                        component={subItem.statusPageComponent}
                        uptimes={statusPageResponse.uptimes}
                        events={statusPageResponse.events.filter(
                          (it) =>
                            it.statusPageComponent.id ===
                            subItem.statusPageComponent?.id
                        )}
                        start={start}
                        end={end}
                      />
                    )}
                  </Item>
                ))}
              </ItemGroup>
            )}
          </div>
        );
      })}
    </Root>
  );
};

export default SystemStatus;
