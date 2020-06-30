import React, { Component } from "react";
import styled, { css } from "styled-components";

const buttonStyles = css`
  border-radius: 4px;
  color: #fff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  font-size: 0.9em;
  font-weight: 600;
  border: 0;
  cursor: pointer;
  outline: none;
  line-height: inherit;
  background-color: #252a34;
  &:hover {
    background-color: #333a48;
  }
  &:active {
    background-color: #3b4354;
  }
  ${(props) =>
    props.remove &&
    css`
      background-color: #b70000;
      &:hover {
        background: #d60000;
      }
      &:active {
        background: #da0000;
      }
    `}
  ${(props) =>
    props.jitsi &&
    css`
      background-color: #0c5ecb;
      background-image: linear-gradient(
        -90deg,
        #0c5ecb 0,
        #0074ff 50%,
        #0c5ecb 100%
      );
      &:hover {
        background-color: #0074ff;
        background-image: none;
      }
      &:active {
        background-color: #0c5ecb;
        background-image: none;
      }
    `}
  ${(props) =>
    props.disabled &&
    css`
      background-color: #ccc !important;
      background-image: none !important;
      cursor: default;
    `}
`;

const Button = styled.a`
  ${buttonStyles}
`;

const Submit = styled.input`
  ${buttonStyles}
`;

Button.Submit = Submit;

export default Button;
