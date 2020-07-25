import React from "react";
import styled from "styled-components";

export default styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  @media (max-width: 760px) {
    flex-direction: column;
  }
`;
