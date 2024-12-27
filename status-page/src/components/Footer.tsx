import styled from "styled-components";
import Image from "next/image";

import logo from "@/app/icon.png";
import { useContext } from "react";
import { StatusPageContext } from "@/app/StatusPageProvider";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
  margin-bottom: 2rem;
  align-items: center;
`;
const Row = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 2rem;
`;

const Footer = () => {
  const context = useContext(StatusPageContext);
  if (!context) {
    return null;
  }

  return (
    <Root>
      <Row>
        <div>Powered by</div>
        <div>
          <a href="https://incidental.dev">Incidental</a>
        </div>
        <div>
          <Image src={logo} alt="Logo" width={16} />
        </div>
      </Row>
      <Row>
        {context.statusPage.privacyPolicyUrl && (
          <div>
            <a href={context.statusPage.privacyPolicyUrl}>Privacy Policy</a>
          </div>
        )}
        {context.statusPage.termsOfServiceUrl && (
          <div>
            <a href={context.statusPage.termsOfServiceUrl}>Terms of Service</a>
          </div>
        )}
      </Row>
    </Root>
  );
};

export default Footer;
