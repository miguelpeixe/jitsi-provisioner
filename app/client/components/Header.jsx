import React from "react";
import styled from "styled-components";

export default styled.div`
  flex: 0 0 auto;
  width: 17%;
  min-width: 300px;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.9em;
  text-align: right;
  border-right: 1px solid rgba(0, 0, 0, 0.2);
  overflow: auto;
  color: #fff;
  h1 {
    margin: 0 0 1rem;
    font-size: 1.6em;
    flex: 0 0 auto;
    line-height: inherit;
  }
  a {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    font-weight: 600;
    flex: 0 0 auto;
  }
  p {
    font-size: 0.9em;
    margin: 0 0 1rem;
  }
  @media (max-width: 1200px) {
    position: static;
  }
  @media (max-width: 760px) {
    width: auto;
    background: #2f3643;
    flex-direction: row;
    align-items: center;
    padding: 1rem;
    border-right: 0;
    margin: 0;
    text-align: left;
    * {
      flex: 0 0 auto;
    }
    h1 {
      flex: 1 1 100%;
      font-size: 1em;
      margin: 0;
    }
    p {
      margin: 0 0 0 0.5rem;
    }
  }
  @media (max-width: 370px) {
    font-size: 0.8em;
  }
`;
