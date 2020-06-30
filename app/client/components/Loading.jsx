import React, { Component } from "react";
import styled, { css } from "styled-components";

const Container = styled.span`
  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  font-size: 2em;
  line-height: 1;
  display: block;
  text-align: center;
  &::after {
    display: block;
    content: "⚆";
    animation-name: rotate;
    animation-duration: 1s;
    animation-timing-function: linear;
    animation-direction: normal;
    animation-iteration-count: infinite;
  }
  ${(props) =>
    props.full &&
    css`
      display: flex;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      align-items: center;
      justify-content: center;
      font-size: 4em;
    `}
`;

export default Container;
