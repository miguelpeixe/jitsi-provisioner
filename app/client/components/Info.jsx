import React from "react";
import styled from "styled-components";

const Container = styled.aside`
  flex: 0 0 auto;
  color: rgba(255, 255, 255, 0.5);
  @media (max-width: 760px) {
    display: none;
  }
`;

export default function () {
  return (
    <Container>
      <p>
        Always remember to check{" "}
        <a
          href="https://aws.amazon.com/ec2/pricing/on-demand/"
          target="_blank"
          rel="external"
        >
          Amazon EC2 pricing table
        </a>{" "}
        and your{" "}
        <a
          href="https://console.aws.amazon.com/billing/home"
          target="_blank"
          rel="external"
        >
          billing dashboard
        </a>
        .
      </p>
      <p>
        AWS instance cost estimates are not guaranteed to be accurate or
        current.
      </p>
      <p>
        This project is experimental and has no relation to{" "}
        <a href="https://jitsi.org/" rel="external" target="_blank">
          Jitsi.org
        </a>
        .
      </p>
      <p>
        <a
          href="https://github.com/miguelpeixe/jitsi-provisioner"
          target="_blank"
          rel="external"
        >
          GitHub
        </a>
      </p>
    </Container>
  );
}
