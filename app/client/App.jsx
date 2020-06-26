import React, { Component } from "react";
import styled, { css } from "styled-components";
import Select from "react-select";

import client from "client";

import Timer from "components/Timer.jsx";

const regions = {
  "af-south-1": "Africa (Cape Town)",
  "ap-east-1": "Asia-Pacific (Hong Kong)",
  "ap-south-1": "Asia-Pacific (Mumbai)",
  "ap-northeast-3": "Asia Pacific (Osaka-Local)",
  "ap-northeast-2": "Asia-Pacific (Seoul)",
  "ap-southeast-1": "Asia-Pacific (Singapore)",
  "ap-southeast-2": "Asia-Pacific (Sydney)",
  "ap-northeast-1": "Asia-Pacific (Tokyo)",
  "ca-central-1": "Canada (Central)",
  "eu-central-1": "Europe (Frankfurt)",
  "eu-west-1": "Europe (Ireland)",
  "eu-west-2": "Europe (London)",
  "eu-west-3": "Europe (Paris)",
  "eu-north-1": "Europe (Stockholm)",
  "eu-south-1": "Europe (Milan)",
  "me-south-1": "Middle East (Bahrain)",
  "sa-east-1": "South America (São Paulo)",
  "us-east-1": "US East (N. Virginia)",
  "us-east-2": "US East (Ohio)",
  "us-west-1": "US West (Northern California)",
  "us-west-2": "US West (Oregon)",
  "us-gov-west-1": "AWS GovCloud (US-West)",
  "us-gov-east-1": "AWS GovCloud (US-East)",
};

const Container = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  @media (max-width: 700px) {
    flex-direction: column;
  }
`;

const Spacer = styled.div`
  flex: 1 1 100%;
`;

const Header = styled.header`
  flex: 0 0 auto;
  width: 17%;
  min-width: 200px;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.9em;
  text-align: right;
  h1 {
    margin: 0 0 1rem;
    font-size: 1.6em;
  }
  a {
    color: #fff;
    text-decoration: none;
    font-weight: 600;
  }
  p {
    font-size: 0.9em;
  }
  @media (max-width: 1050px) {
    position: static;
  }
  @media (max-width: 700px) {
    width: auto;
    background: #333;
    flex-direction: row;
    align-items: center;
    padding: 1rem;
    * {
      flex: 0 0 auto;
    }
    h1 {
      flex: 1 1 100%;
      margin: 0;
    }
  }
`;

const Content = styled.section`
  overflow: auto;
  flex: 1 1 100%;
`;

const buttonStyles = css`
  border-radius: 4px;
  color: #fff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  font-size: 0.9em;
  font-weight: 600;
  background: #252a34;
  border: 0;
  cursor: pointer;
  outline: none;
  line-height: inherit;
  &:hover {
    background: #333a48;
  }
  &:active {
    background: #3b4354;
  }
  ${(props) =>
    props.remove &&
    css`
      background-color: #b70000;
      &:hover {
        background: #d60000;
      }
      &:active {
        background: #da0000;
      }
    `}
  ${(props) =>
    props.disabled &&
    css`
      background-color: #ccc !important;
      cursor: default;
    `}
`;

const Button = styled.a`
  ${buttonStyles}
`;

const Submit = styled.input`
  ${buttonStyles}
`;

const InstanceList = styled.ul`
  margin: 4rem auto;
  padding: 0;
  max-width: 500px;
  list-style: none;
`;

const Instance = styled.li`
  background: #fff;
  color: #333;
  border-radius: 4px;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  margin: 0 2rem 2rem;
  ${(props) =>
    props.new &&
    css`
      background-image: linear-gradient(
        -90deg,
        #ffebf5 0,
        #ffffff 50%,
        #ffebf5 100%
      );
    `}
  h3 {
    margin: 0 0 1rem;
    font-family: monospace;
    text-transform: uppercase;
    font-weight: 600;
  }
  a {
    color: #61b9ff;
    text-decoration: none;
    &:hover,
    &:active {
      color: #4aafff;
    }
  }
  nav {
    a,
    a:active,
    a:hover {
      color: #fff;
    }
  }
  section {
    padding: 1rem 2rem;
    input[type="submit"] {
      ${buttonStyles}
    }
    select {
      background: transparent;
      border: 0;
    }
    table {
      font-size: 0.9em;
      width: 100%;
      border-spacing: 0;
      th,
      td {
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        padding: 0.5rem 0;
      }
      th {
        font-weight: 600;
        color: rgba(0, 0, 0, 0.4);
      }
      td {
        text-align: right;
      }
      tr:last-child {
        th,
        td {
          border-bottom: 0;
        }
      }
    }
  }
`;

const InstanceHeader = styled.header`
  display: flex;
  align-items: center;
  padding: 1.5rem 2rem;
  margin: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  h3 {
    flex: 1 1 100%;
    margin: 0;
    color: #252a34;
  }
  p {
    font-size: 0.8em;
    margin: 0 0 0 1rem;
    flex: 0 0 auto;
    color: rgba(0, 0, 0, 0.5);
  }
`;

const Buttons = styled.nav`
  display: flex;
  margin: 0;
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 0 0 4px 4px;
  a,
  input {
    text-align: center;
    flex: 1 1 100%;
    margin: 0 0.5rem;
  }
`;

const InstanceInfoContainer = styled.div`
  padding: 0.5rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 0.9em;
  margin-top: 1rem;
  p {
    margin: 0;
    text-align: center;
    font-style: italic;
  }
`;

class InstanceInfo extends Component {
  render() {
    const { instance, region } = this.props;
    console.log(instance);
    if (!instance) return;
    return (
      <InstanceInfoContainer>
        {instance.pricing[region] ? (
          <table>
            <tr>
              <th>Name</th>
              <td>{instance.prettyName}</td>
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
      </InstanceInfoContainer>
    );
  }
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      instances: [],
      newInstance: false,
      awsInstances: [],
      regionOptions: Object.keys(regions).map((value) => {
        return {
          label: regions[value],
          value,
        };
      }),
      instanceOptions: [],
      formData: {
        region: "us-east-1",
        type: "t3.large",
      },
    };
    this.service = client.service("instances");
  }
  componentDidMount() {
    client
      .service("aws")
      .find()
      .then((data) => {
        let allOptions = [];
        this.setState({ awsInstances: data });
        for (const option of data) {
          allOptions.push({
            value: option._id,
            label: option._id,
          });
        }

        this.setState({
          instanceOptions: [
            {
              label: "Recommended",
              options: [
                {
                  label: "t3.large",
                  value: "t3.large",
                },
              ],
            },
            {
              label: "All options",
              options: allOptions,
            },
          ],
        });
      });

    this.service.find().then((instances) => {
      this.setState({ instances });
    });
    this.service.on("created", (instance) => {
      this.setState({
        instances: [instance, ...this.state.instances],
      });
    });
    this.service.on("patched", (instance) => {
      const instances = [...this.state.instances];
      const idx = instances.findIndex((i) => i._id == instance._id);
      if (Number.isInteger(idx)) {
        instances[idx] = instance;
        this.setState({ instances });
      }
    });
    this.service.on("removed", (instance) => {
      if (instance.status == "removing") return;
      const instances = [...this.state.instances];
      const idx = instances.findIndex((i) => i._id == instance._id);
      if (Number.isInteger(idx)) {
        instances.splice(idx, 1);
        this.setState({ instances });
      }
    });
  }
  _getInstance = (instance = false) => {
    const { awsInstances } = this.state;
    instance = instance || this.state.formData.type;
    if (!awsInstances.length || !instance) return;
    return awsInstances.find((item) => item._id == instance);
  };
  _handleNewClick = () => (ev) => {
    ev.preventDefault();
    this.setState({ newInstance: true });
  };
  _handleCloseNewClick = (ev) => {
    ev.preventDefault();
    this.setState({ newInstance: false });
  };
  _handleSubmit = (ev) => {
    ev.preventDefault();
    const { formData } = this.state;
    this.service.create(formData).then(() => {
      this.setState({ newInstance: false });
    });
  };
  _handleCreateClick = () => (ev) => {
    ev.preventDefault();
    this.service.create({});
  };
  _handleRemoveClick = (instance) => (ev) => {
    ev.preventDefault();
    if (this._canTerminate(instance)) {
      this.service.remove(instance._id);
    }
  };
  _getTypeValue = () => {
    const { formData } = this.state;
    return { label: formData.type, value: formData.type };
  };
  _getRegionValue = () => {
    const { regionOptions, formData } = this.state;
    const option = regionOptions.find(
      (option) => formData.region == option.value
    );
    return option;
  };
  _canTerminate = (instance) => {
    return (
      instance.status == "draft" ||
      instance.status == "failed" ||
      instance.status == "running" ||
      instance.status == "timeout"
    );
  };
  _getLink = (instance) => {
    if (instance.status == "running") {
      const url = `https://${instance.domain}`;
      return (
        <a href={url} rel="external" target="_blank">
          {url}
        </a>
      );
    }
    return "--";
  };
  render() {
    const {
      newInstance,
      regionOptions,
      instanceOptions,
      formData,
      instances,
    } = this.state;
    return (
      <Container>
        <Header>
          <h1>Jitsi Provisioner</h1>
          {instances.length ? (
            <Button href="#" onClick={this._handleNewClick()}>
              New instance
            </Button>
          ) : null}
          <Spacer />
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
            This project is experimental and has no relation to{" "}
            <a href="https://jitsi.org/" rel="external" target="_blank">
              Jitsi.org
            </a>
            .
          </p>
        </Header>
        <Content>
          <InstanceList>
            {newInstance || !instances.length ? (
              <Instance new>
                <form onSubmit={this._handleSubmit}>
                  <InstanceHeader>
                    <h3>New instance</h3>
                    {instances.length ? (
                      <p>
                        <a href="#" onClick={this._handleCloseNewClick}>
                          Cancel
                        </a>
                      </p>
                    ) : null}
                  </InstanceHeader>
                  <section>
                    <table>
                      <tr>
                        <th>Region</th>
                        <td>
                          <Select
                            options={regionOptions}
                            onChange={(selected) => {
                              this.setState({
                                formData: {
                                  ...formData,
                                  region: selected.value,
                                },
                              });
                            }}
                            value={this._getRegionValue()}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Type</th>
                        <td>
                          <Select
                            options={instanceOptions}
                            onChange={(selected) => {
                              this.setState({
                                formData: {
                                  ...formData,
                                  type: selected.value,
                                },
                              });
                            }}
                            value={this._getTypeValue()}
                          />
                        </td>
                      </tr>
                    </table>
                    <InstanceInfo
                      instance={this._getInstance()}
                      region={formData.region}
                    />
                  </section>
                  <Buttons>
                    <Submit type="submit" value="Create new instance" />
                  </Buttons>
                </form>
              </Instance>
            ) : null}
            {instances.map((instance) => (
              <Instance key={instance._id}>
                <InstanceHeader>
                  <h3>{instance.serverName}</h3>
                  {instance.provisionedAt ? (
                    <p>
                      <Timer date={instance.provisionedAt} />
                    </p>
                  ) : null}
                  <p>{instance.status}</p>
                </InstanceHeader>
                <section>
                  <table>
                    <tr>
                      <th>Region</th>
                      <td>{instance.region}</td>
                    </tr>
                    <tr>
                      <th>Type</th>
                      <td>{instance.type}</td>
                    </tr>
                    <tr>
                      <th>URL</th>
                      <td>{this._getLink(instance)}</td>
                    </tr>
                  </table>
                  <InstanceInfo
                    instance={this._getInstance(instance.type)}
                    region={instance.region}
                  />
                </section>
                <Buttons>
                  <Button
                    remove
                    disabled={!this._canTerminate(instance)}
                    href="#"
                    onClick={this._handleRemoveClick(instance)}
                  >
                    Terminate
                  </Button>{" "}
                  <Button
                    disabled={instance.status !== "running"}
                    href={`https://${instance.domain}`}
                    target="_blank"
                    rel="external"
                  >
                    Launch Jitsi
                  </Button>
                </Buttons>
              </Instance>
            ))}
          </InstanceList>
        </Content>
      </Container>
    );
  }
}
