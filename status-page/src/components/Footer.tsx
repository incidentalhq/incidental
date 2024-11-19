import styled from "styled-components";

const Root = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

const Footer = () => {
  return (
    <Root>
      <p>
        Powered by <a href="https://incidental.dev">Incidental</a>
      </p>
    </Root>
  );
};

export default Footer;
