import React, { Component } from "react";
import styled from "styled-components";

const FlexTable = styled.div`
  width: 100%;
  white-space: nowrap;
  margin: 0 0 1rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4em 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  &:last-child {
    border-bottom: 0;
  }
`;

const Head = styled.div`
  flex: 1 1 100%;
  margin-right: 2rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.4);
  @media (max-width: 370px) {
    margin-right: 1.5rem;
  }
`;

const Data = styled.div`
  flex: 1 1 100%;
  text-align: right;
  input {
    margin: 0;
  }
`;

FlexTable.Row = Row;
FlexTable.Head = Head;
FlexTable.Data = Data;

export default FlexTable;
