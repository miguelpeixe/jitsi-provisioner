import React, { Component } from "react";
import styled from "styled-components";

import FlexTable from "components/FlexTable.jsx";

const Container = styled.div`
  padding: 0.5rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin: 0 0 1rem;
  font-size: 0.8em;
  div {
    margin: 0;
  }
`;

const Summary = styled.div`
  display: flex;
  cursor: pointer;
  align-items: center;
  h4 {
    flex: 1 1 100%;
    margin: 0;
    font-weight: 600;
    font-size: 1.1em;
  }
  p {
    flex: 0 0 auto;
    margin: 0;
    color: #666;
    font-size: 0.9em;
    &:after {
      content: "·";
      padding: 0 0.3rem;
    }
    &:last-child:after {
      content: none;
    }
  }
`;

export default class ServerInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
    };
  }
  componentDidMount() {}
  _handleSummaryClick = (ev) => {
    ev.preventDefault();
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };
  render() {
    const { collapsed } = this.state;
    const { instance, region, full } = this.props;
    if (!instance) return null;
    return (
      <Container>
        {!full ? (
          <Summary onClick={this._handleSummaryClick}>
            <h4>Server info</h4>
            {collapsed ? (
              <>
                <p>{instance.memory} GiB</p>
                <p>
                  {instance.vcpu}x {instance.clockSpeed} vCPUs
                </p>
                <p>
                  <strong>${instance.pricing[region]}/hour</strong>
                </p>
              </>
            ) : null}
          </Summary>
        ) : null}
        {!collapsed || full ? (
          <div>
            {instance.pricing[region] ? (
              <FlexTable>
                <FlexTable.Row>
                  <FlexTable.Head>Processor</FlexTable.Head>
                  <FlexTable.Data>{instance.processor}</FlexTable.Data>
                </FlexTable.Row>
                <FlexTable.Row>
                  <FlexTable.Head>vCPU count</FlexTable.Head>
                  <FlexTable.Data>{instance.vcpu}</FlexTable.Data>
                </FlexTable.Row>
                <FlexTable.Row>
                  <FlexTable.Head>Clock speed</FlexTable.Head>
                  <FlexTable.Data>{instance.clockSpeed}</FlexTable.Data>
                </FlexTable.Row>
                <FlexTable.Row>
                  <FlexTable.Head>Memory</FlexTable.Head>
                  <FlexTable.Data>{instance.memory} GiB</FlexTable.Data>
                </FlexTable.Row>
                <FlexTable.Row>
                  <FlexTable.Head>Network speed</FlexTable.Head>
                  <FlexTable.Data>{instance.network}</FlexTable.Data>
                </FlexTable.Row>
                <FlexTable.Row>
                  <FlexTable.Head>Estimated cost</FlexTable.Head>
                  <FlexTable.Data>
                    <strong>${instance.pricing[region]}/hour</strong>
                  </FlexTable.Data>
                </FlexTable.Row>
              </FlexTable>
            ) : (
              <p style={{ textAlign: "center", margin: "1rem 0" }}>
                Instance type not available in this region
              </p>
            )}
          </div>
        ) : null}
      </Container>
    );
  }
}
