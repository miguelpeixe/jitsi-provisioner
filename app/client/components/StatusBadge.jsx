import React, { Component } from "react";
import styled, { css } from "styled-components";

export default styled.div`
  display: block;
  width: 7px;
  height: 7px;
  background: #ddd;
  box-shadow: 0 0 1rem #ddd;
  border: 1px solid #ccc;
  border-radius: 100%;
  ${(props) =>
    props.status == "active" &&
    css`
      background: #05ff7e;
      border-color: #00ed73;
      box-shadow: 0 0 1rem #05ff7e;
    `}
  ${(props) =>
    props.status == "loading" &&
    css`
      background: #f2ff00;
      border-color: #e1ed00;
      box-shadow: 0 0 1rem #f2ff00;
    `}
    ${(props) =>
      props.status == "error" &&
      css`
        background: #ff2e2e;
        border-color: #d62222;
        box-shadow: 0 0 1rem #ff2e2e;
      `}
`;
