import styled from "styled-components";
import Image from "next/image";

import logo from "@/app/assets/mark_noborder.png";

const Root = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  margin-bottom: 2rem;
  gap: 0.5rem;
  align-items: center;
`;

const Footer = () => {
  return (
    <Root>
      <div>Powered by</div>
      <div>
        <a href="https://incidental.dev">Incidental</a>
      </div>
      <div>
        <Image src={logo} alt="Logo" width={16} />
      </div>
    </Root>
  );
};

export default Footer;
