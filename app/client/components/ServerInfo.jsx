import React, { Component } from "react";
import styled from "styled-components";

const Container = styled.div`
  padding: 0.5rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 0.9em;
  margin-top: 1rem;
  @media (max-width: 700px) {
    padding: 0.5rem;
  }
`;

const Summary = styled.div`
  display: flex;
  font-size: 0.8em;
  cursor: pointer;
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
    if (!instance) return;
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
              <table>
                <tr>
                  <th>Processor</th>
                  <td>{instance.processor}</td>
                </tr>
                <tr>
                  <th>vCPU count</th>
                  <td>{instance.vcpu}</td>
                </tr>
                <tr>
                  <th>Clock speed</th>
                  <td>{instance.clockSpeed}</td>
                </tr>
                <tr>
                  <th>Memory</th>
                  <td>{instance.memory} GiB</td>
                </tr>
                <tr>
                  <th>Network speed</th>
                  <td>{instance.network}</td>
                </tr>
                <tr>
                  <th>Estimated cost</th>
                  <td>
                    <strong>${instance.pricing[region]}/hour</strong>
                  </td>
                </tr>
              </table>
            ) : (
              <p>Not available</p>
            )}
          </div>
        ) : null}
      </Container>
    );
  }
}