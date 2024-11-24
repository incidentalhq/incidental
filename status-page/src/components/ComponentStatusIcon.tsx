import Image from "next/image";
import styled from "styled-components";

import check from "@/app/assets/check.svg";
import redTriangle from "@/app/assets/warning-triangle-red.svg";
import orangeTriangle from "@/app/assets/warning-triangle.svg";

import { ComponentStatus } from "@/types/enums";

const Root = styled.div``;

const getComponentStatusIcon = (status: ComponentStatus) => {
  switch (status) {
    case ComponentStatus.OPERATIONAL:
      return check;
    case ComponentStatus.DEGRADED_PERFORMANCE:
      return orangeTriangle;
    case ComponentStatus.PARTIAL_OUTAGE:
    case ComponentStatus.FULL_OUTAGE:
      return redTriangle;
    default:
      return check;
  }
};

const ComponentStatusIcon = ({ status }: { status: ComponentStatus }) => {
  return (
    <Root>
      <Image src={getComponentStatusIcon(status)} width={16} alt={status} />
    </Root>
  );
};

export default ComponentStatusIcon;
