import { Link } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";

const BtnAnimation = keyframes`
  0% {
    background-position:0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position:0% 50%;
  }
`;

const buttonCss = css`
  background-color: #fff;
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-md);
  border: 0;
  box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0.12) 0px 1px 1px 0px, rgba(60, 66, 87, 0.16) 0px 0px 0px 1px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(60, 66, 87, 0.12) 0px 2px 5px 0px;

  &:hover {
    background-color: var(--color-gray-100);
    text-decoration: none;
    color: var(--color-gray-900);
  }

  &:focus {
    outline: thin dotted;
  }

  &[disabled] {
    background-color: var(--color-gray-100);
    color: var(--color-gray-300);
    box-shadow: none;
  }

  transition: color 0.2s, background-color 0.2s;
  text-decoration: none;
  color: var(--color-gray-900);
  cursor: pointer;
`;

const deleteButtonCss = css`
  color: var(--color-red-400);
  &:hover {
    color: var(--color-red-600);
    background-color: var(--color-red-100);
  }
`;

const primaryButtonCss = css`
  background: linear-gradient(45deg, #ea30e6, #f03378);
  color: #fff;
  box-shadow: 0 2px 4px 0 rgba(14, 30, 37, 0.12);
  background-size: 200% 200%;

  &:hover {
    animation: ${BtnAnimation} 2s ease infinite;
    color: #fff;
  }
  &:visited {
    color: #fff;
  }
`;

interface ButtonCustomProps {
  danger?: boolean;
  primary?: boolean;
}

export const Button = styled.button<ButtonCustomProps>`
  ${buttonCss}
  ${(props) => (props.danger ? deleteButtonCss : null)}
  ${(props) => (props.primary ? primaryButtonCss : "")}
`;

export const Box = styled.div`
  background: #fff;
  border-radius: var(--radius-md);
  box-shadow: var(--stripe-shadow);
  position: relative;
  margin-bottom: 1rem;
  overflow: hidden; // bottom left + right corners are rendered properly
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  thead > tr > th {
    font-weight: 400;
    background-color: var(--color-blue-50);
  }

  tr td:first-child,
  tr th:first-child {
    padding-left: 16px;
  }

  tr td:last-child,
  tr th:last-child {
    padding-right: 16px;
  }

  td,
  th {
    padding-top: 10px;
    padding-bottom: 10px;
    box-shadow: inset 0 -1px var(--color-gray-200);
  }
`;

interface HeaderStyleProps {
  includeSeparator?: boolean;
}

export const Header = styled.div<HeaderStyleProps>`
  padding-top: 16px;
  padding-bottom: 16px;
  padding-left: 20px;
  padding-right: 20px;
  box-shadow: ${(props) =>
    props.includeSeparator === false ? "none" : "inset 0 -1px #e3e8ee"};
  display: flex;
  justify-content: space-between;
  outline: none;
`;
interface ContentProps {
  $padding?: boolean;
}

export const Content = styled.div<ContentProps>`
  padding: ${(props) => (props.$padding === false ? "0" : "1rem 20px")};
  position: relative;
`;

export const Title = styled.span`
  font-size: 1.2rem;
`;

export const Subtitle = styled.div`
  font-size: 0.9rem;
  color: var(--color-gray-600);
`;

export const LinkButton = styled(Link)`
  ${buttonCss}
`;

export const SectionTitle = styled.h2`
  font-weight: 500;
  margin-bottom: 1rem;
`;

export const PrimaryLinkButton = styled(LinkButton)`
  ${primaryButtonCss}
`;

export const LargePrimaryLinkButton = styled(LinkButton)`
  ${primaryButtonCss}
  padding: 1rem;
`;
