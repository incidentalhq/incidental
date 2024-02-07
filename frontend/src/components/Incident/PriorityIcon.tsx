import styled from "styled-components";

const Root = styled.div`
  padding: 1rem 20px;
  border-top: 1px solid var(--color-gray-200);
`;

interface Props {
  ranking: number;
  totalRankings: number;
}

const PriorityIcon: React.FC<Props> = ({ ranking, totalRankings = 3 }) => {
  return (
    <Root>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="#858699"
        role="img"
        focusable="false"
      >
        <rect x="1" y="8" width="3" height="6" rx="1"></rect>
        <rect x="6" y="5" width="3" height="9" rx="1"></rect>
        <rect
          x="11"
          y="2"
          width="3"
          height="12"
          rx="1"
          fill-opacity="0.4"
        ></rect>
      </svg>
      ;
    </Root>
  );
};

export default PriorityIcon;
