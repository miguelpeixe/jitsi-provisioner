import React, { Component } from "react";
import styled, { css } from "styled-components";

const Container = styled.div`
  overflow: auto;
  flex: 1 1 100%;
  padding: 1rem 2rem;
  @media (max-width: 700px) {
    padding: 1rem;
  }
`;

const Content = styled.div`
  margin: 4rem auto;
  max-width: 500px;
  @media (max-width: 1050px) {
    max-width: none;
  }
  @media (max-width: 700px) {
    margin: 0 auto;
  }
`;

export default function (props) {
  return (
    <Container>
      <Content>{this.props.children}</Content>
    </Container>
  );
}
