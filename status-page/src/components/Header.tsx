import { StatusPageContext } from "@/app/StatusPageProvider";
import { useContext } from "react";
import styled from "styled-components";

const Root = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-slate-200);
  padding-bottom: 1rem;
  margin: 1rem 0;
  align-items: center;

  h1 {
    font-size: 1.8rem;
    font-weight: 600;
    margin: 0;
  }
`;

const Header = () => {
  const context = useContext(StatusPageContext);
  if (!context) {
    throw new Error(
      "useStatusPageContext must be used within a StatusPageProvider"
    );
  }

  return (
    <Root>
      <h1>{context.statusPage.name}</h1>
      {context.statusPage.supportUrl && (
        <a
          href={context.statusPage.supportUrl}
          target="_blank"
          rel="noreferrer"
        >
          {context.statusPage.supportLabel}
        </a>
      )}
    </Root>
  );
};

export default Header;
