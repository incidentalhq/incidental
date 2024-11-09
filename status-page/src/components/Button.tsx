"use client";

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

  &[disabled] img {
    filter: opacity(0.2);
  }

  transition: color 0.2s, background-color 0.2s;
  text-decoration: none;
  color: var(--color-gray-900);
  cursor: pointer;
`;

const deleteButtonCss = css`
  color: var(--color-red-400);

  &:not(:disabled):hover {
    color: var(--color-red-600);
    background-color: var(--color-red-100);
  }
`;

const primaryButtonCss = css`
  background: var(--color-brand);
  color: var(--color-brand-dark);

  font-weight: 500;

  &:hover {
    animation: ${BtnAnimation} 2s ease infinite;
    background-color: #9edf86;
  }
  &:visited {
    color: var(--color-brand-dark);
  }
`;

export interface StyledButtonCustomProps {
  $danger?: boolean;
  $primary?: boolean;
}

export const Button = styled.button<StyledButtonCustomProps>`
  ${buttonCss}
  ${(props) => (props.$danger ? deleteButtonCss : null)}
  ${(props) => (props.$primary ? primaryButtonCss : "")}
`;
