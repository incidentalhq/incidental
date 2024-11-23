import styled from "styled-components";
import UptimeTimeline from "./UptimeTimeline";
import type { IStatusPageResponse } from "@/types/models";

const Root = styled.div`
  border: 1px solid var(--color-slate-200);
  border-radius: var(--radius-md);
`;
const Name = styled.div`
  font-weight: 500;
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

  > ${Name} {
    font-weight: 500;
    margin-bottom: 1rem;
  }

  ${Item} {
    border-bottom: none;
    padding: 0;
  }
`;
const UptimeGraphHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;
const UptimeGraphFooter = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--color-gray-500);
  margin-top: 0.5rem;
`;
const ComponentsCount = styled.span`
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
                <UptimeGraphHeader>
                  <Name>{item.statusPageComponent.name}</Name>
                  <div>
                    {(
                      statusPageResponse.uptimes[item.statusPageComponent.id] *
                      100
                    ).toFixed(4)}
                    %
                  </div>
                </UptimeGraphHeader>
                <UptimeTimeline
                  events={statusPageResponse.events.filter(
                    (it) =>
                      it.statusPageComponent.id === item.statusPageComponent?.id
                  )}
                  timeRange={{ start, end }}
                  intervals={90}
                />
                <UptimeGraphFooter>
                  <div>90 days ago</div>
                  <div>Today</div>
                </UptimeGraphFooter>
              </Item>
            )}

            {item.statusPageComponentGroup && (
              <ItemGroup>
                <Name>
                  <span>{item.statusPageComponentGroup.name}</span>
                  <ComponentsCount>
                    ({item.statusPageItems?.length})
                  </ComponentsCount>
                </Name>
                {item.statusPageItems?.map((subItem) => (
                  <Item key={subItem.id}>
                    {subItem.statusPageComponent && (
                      <>
                        <UptimeGraphHeader>
                          <Name>{subItem.statusPageComponent.name}</Name>
                          <div>
                            {(
                              statusPageResponse.uptimes[
                                subItem.statusPageComponent.id
                              ] * 100
                            ).toFixed(4)}
                            %
                          </div>
                        </UptimeGraphHeader>

                        <UptimeTimeline
                          events={statusPageResponse.events.filter(
                            (it) =>
                              it.statusPageComponent.id ===
                              subItem.statusPageComponent?.id
                          )}
                          timeRange={{ start, end }}
                          intervals={90}
                        />
                        <UptimeGraphFooter>
                          <div>90 days ago</div>
                          <div>Today</div>
                        </UptimeGraphFooter>
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

export default SystemStatus;
