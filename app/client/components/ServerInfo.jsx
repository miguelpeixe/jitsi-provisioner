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
      awsInstance: null,
      collapsed: true,
    };
  }
  componentDidMount() {
    this._fetchAWS();
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.type != this.props.type) {
      this._fetchAWS();
    }
  }
  _fetchAWS() {
    const { type } = this.props;
    API.aws.get(type).then((data) => {
      this.setState({
        awsInstance: data,
      });
    });
  }
  _handleSummaryClick = (ev) => {
    ev.preventDefault();
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };
  render() {
    const { awsInstance, collapsed } = this.state;
    const { region, full } = this.props;
    if (!awsInstance) return null;
    return (
      <Container>
        {!full ? (
          <Summary onClick={this._handleSummaryClick}>
            <h4>Server info</h4>
            {collapsed ? (
              <>
                <p>{awsInstance.memory} GiB</p>
                <p>
                  {awsInstance.vcpu}x {awsInstance.clockSpeed} vCPUs
                </p>
                <p>
                  <strong>${awsInstance.pricing[region]}/hour</strong>
                </p>
              </>
            ) : null}
          </Summary>
        ) : null}
        {!collapsed || full ? (
          <div>
            {awsInstance.pricing[region] ? (
              <FlexTable>
                <FlexTable.Row>
                  <FlexTable.Head>Processor</FlexTable.Head>
                  <FlexTable.Data>{awsInstance.processor}</FlexTable.Data>
                </FlexTable.Row>
                <FlexTable.Row>
                  <FlexTable.Head>vCPU count</FlexTable.Head>
                  <FlexTable.Data>{awsInstance.vcpu}</FlexTable.Data>
                </FlexTable.Row>
                <FlexTable.Row>
                  <FlexTable.Head>Clock speed</FlexTable.Head>
                  <FlexTable.Data>{awsInstance.clockSpeed}</FlexTable.Data>
                </FlexTable.Row>
                <FlexTable.Row>
                  <FlexTable.Head>Memory</FlexTable.Head>
                  <FlexTable.Data>{awsInstance.memory} GiB</FlexTable.Data>
                </FlexTable.Row>
                <FlexTable.Row>
                  <FlexTable.Head>Network speed</FlexTable.Head>
                  <FlexTable.Data>{awsInstance.network}</FlexTable.Data>
                </FlexTable.Row>
                <FlexTable.Row>
                  <FlexTable.Head>Estimated cost</FlexTable.Head>
                  <FlexTable.Data>
                    <strong>${awsInstance.pricing[region]}/hour</strong>
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
