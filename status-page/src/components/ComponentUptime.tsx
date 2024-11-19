import styled from "styled-components";
import UptimeGraph from "./UptimeGraph";
import { getDaysInMonth } from "date-fns";
import { IStatusPageResponse } from "@/types/models";

const Root = styled.div`
  border: 1px solid var(--color-slate-200);
  border-radius: var(--radius-md);
`;
const Header = styled.div`
  padding: 1rem;
  background-color: var(--color-slate-50);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
`;
const Name = styled.div`
  font-weight: 500;
`;
const Item = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--color-slate-200);
`;
const ItemGroup = styled.div`
  padding: 1rem;

  > ${Name} {
    font-weight: 500;
    margin-bottom: 1rem;
  }

  ${Item} {
    border-bottom: none;
    padding: 0;
  }
`;

interface Props {
  statusPageResponse: IStatusPageResponse;
  start: Date;
  end: Date;
}
const ComponentUptime: React.FC<Props> = ({
  statusPageResponse,
  start,
  end,
}) => {
  return (
    <Root>
      <Header>
        <h2>System status</h2>
      </Header>
      {statusPageResponse.statusPage.statusPageItems.map((item) => {
        return (
          <div key={item.id}>
            {item.statusPageComponent && (
              <Item>
                <Name>{item.statusPageComponent.name}</Name>
                <UptimeGraph
                  events={statusPageResponse.events.filter(
                    (it) =>
                      it.statusPageComponent.id === item.statusPageComponent?.id
                  )}
                  timeRange={{ start, end }}
                  intervals={getDaysInMonth(start)}
                />
              </Item>
            )}

            {item.statusPageComponentGroup && (
              <ItemGroup>
                <Name>
                  {item.statusPageComponentGroup.name} (
                  {item.statusPageItems?.length})
                </Name>
                {item.statusPageItems?.map((subItem) => (
                  <Item key={subItem.id}>
                    {subItem.statusPageComponent && (
                      <>
                        <Name>{subItem.statusPageComponent.name}</Name>
                        <UptimeGraph
                          events={statusPageResponse.events.filter(
                            (it) =>
                              it.statusPageComponent.id ===
                              subItem.statusPageComponent?.id
                          )}
                          timeRange={{ start, end }}
                          intervals={getDaysInMonth(start)}
                        />
                      </>
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

export default ComponentUptime;
