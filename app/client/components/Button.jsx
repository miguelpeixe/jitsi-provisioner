import React, { Component } from "react";
import styled, { css } from "styled-components";

const buttonStyles = css`
  border-radius: 4px;
  color: #fff;
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  font-size: 0.9em;
  font-weight: 600;
  border: 0;
  cursor: pointer;
  outline: none;
  line-height: inherit;
  background-color: #252a34;
  border: 1px solid #333a48;
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
      border-color: #9c0000;
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
      border-color: #0c5ecb;
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
      background-color: rgba(0, 0, 0, 0.1) !important;
      background-image: none !important;
      border-color: rgba(0, 0, 0, 0.1);
      cursor: not-allowed;
    `}
`;

const Button = styled.a`
  ${buttonStyles}
`;

const Submit = styled.input`
  ${buttonStyles}
`;

const Badge = styled.span`
  position: relative;
  top: -0.05rem;
  font-size: 0.8em;
  border-radius: 4px;
  line-height: 1;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.3rem 0.3rem;
  display: inline-block;
  margin-left: 0.5rem;
  letter-spacing: 0.08rem;
  font-weight: normal;
`;

Button.Submit = Submit;
Button.Badge = Badge;

export default Button;
