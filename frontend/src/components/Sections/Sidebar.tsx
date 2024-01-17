import {
  faAt,
  faClipboard,
  faInbox,
  faPoll,
  faTrafficLight,
  faTree,
  faUsersCrown,
} from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IUser } from "shared-types/types";
import styled, { css, keyframes } from "styled-components";

import logo from "@/assets/mark_900.svg";
import { AdminRoutePaths, RoutePaths } from "@/routes";

const colorCycle = keyframes`
  from {
    filter: hue-rotate(0deg);
  }
  to {
    filter: hue-rotate(180deg);
  }
`;

const Root = styled.div`
  align-items: center;
`;
const LogoSection = styled.div`
  margin-bottom: 2rem;
`;

interface LogoImageProps {
  $animate: boolean;
}

const Logo = styled.img<LogoImageProps>`
  display: block;
  width: 64px;
  ${(props) =>
    props.$animate
      ? css`
          animation: 1s ease-in 0s 2 alternate ${colorCycle};
        `
      : "none;"}
`;

const LogoWrapper = styled.div`
  display: inline-block;
  display: flex;
  justify-content: center;
`;

const MenuItems = styled.div`
  padding: 0;
  margin: 0;
`;
const Item = styled(Link)`
  display: block;
  color: #1f4d63;
  text-decoration: none;
  margin-bottom: 1rem;

  &:visited {
    color: #1f4d63;
  }

  &:hover {
    color: var(--color-blue-700);
  }
`;

interface Props {
  user: IUser;
}

const SideBar: React.FC<Props> = ({ user }) => {
  const location = useLocation();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 2000);
  }, [location.pathname]);

  return (
    <Root>
      <LogoSection>
        <Link to={RoutePaths.DASHBOARD}>
          <LogoWrapper>
            <Logo $animate={animate} src={logo} alt="Logo" />
          </LogoWrapper>
        </Link>
      </LogoSection>
      <MenuItems>
        <Item to={AdminRoutePaths.POSTS_LIST}>
          <FontAwesomeIcon icon={faClipboard} fixedWidth={true} /> All posts
        </Item>
        <Item to={AdminRoutePaths.INBOX}>
          <FontAwesomeIcon icon={faAt} fixedWidth={true} /> Assigned to me
        </Item>
        <Item to={RoutePaths.ROADMAP}>
          <FontAwesomeIcon icon={faTrafficLight} fixedWidth={true} /> Roadmap
        </Item>
        <Item to={RoutePaths.CHANGELOG}>
          <FontAwesomeIcon icon={faTree} fixedWidth={true} /> Changelog
        </Item>
      </MenuItems>
    </Root>
  );
};

export default SideBar;
