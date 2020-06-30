import React, { Component } from "react";
import styled, { css } from "styled-components";
import Select from "react-select";

// import client from "feathers";
const client = window.API;

import Content from "components/Content.jsx";
import Loading from "components/Loading.jsx";
import Button from "components/Button.jsx";
import Card from "components/Card.jsx";
import Login from "components/Login.jsx";

import ServerInfo from "components/ServerInfo.jsx";
import Timer from "components/Timer.jsx";
import LiveCost from "components/LiveCost.jsx";

import regions from "regions";

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
  min-width: 170px;
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
  border-right: 1px solid #ae1253;
  overflow: auto;
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
  @media (max-width: 350px) {
    font-size: 0.8em;
    p {
    }
  }
`;

const Info = styled.aside`
  @media (max-width: 700px) {
    display: none;
  }
`;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // state
      ready: false,
      loading: false,
      creating: false,
      newInstance: false,
      // data
      auth: null,
      instances: [],
      awsInstances: [],
      // form options
      regionOptions: Object.keys(regions).map((value) => {
        return {
          label: regions[value],
          value,
        };
      }),
      instanceOptions: [],
      // form data
      formData: {
        region: "us-east-1",
        type: "t3.large",
      },
    };
    this.service = client.service("instances");
    this.contentRef = React.createRef();
  }
  componentDidMount() {
    client
      .reAuthenticate()
      .catch((err) => {
        client.logout();
      })
      .finally(() => {
        this.setState({
          ready: true,
        });
      });
    client.on("login", (auth) => {
      this.setState({ auth });
      this._fetchAWS();
      this._fetchInstances();
    });
    client.on("logout", () => {
      this.setState({ auth: false, instances: [] });
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
  _fetchAWS = () => {
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
  };
  _fetchInstances = () => {
    this.setState({
      loading: true,
    });
    this.service
      .find({
        query: {
          $sort: {
            createdAt: -1,
          },
        },
      })
      .then((instances) => {
        this.setState({ instances });
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  };
  _getServer = (instance = false) => {
    const { awsInstances } = this.state;
    instance = instance || this.state.formData.type;
    if (!awsInstances.length || !instance) return;
    return awsInstances.find((item) => item._id == instance);
  };
  _handleLogoutClick = (ev) => {
    ev.preventDefault();
    client.logout();
  };
  _handleNewClick = () => (ev) => {
    ev.preventDefault();
    if (!this._canCreate()) return;
    this.setState({ newInstance: true });
    this.contentRef.current.base.scrollTop = 0;
  };
  _handleCloseNewClick = (ev) => {
    ev.preventDefault();
    this.setState({ newInstance: false });
  };
  _handleSubmit = (ev) => {
    ev.preventDefault();
    const { formData } = this.state;
    this.setState({
      creating: true,
    });
    this.service
      .create(formData)
      .then(() => {
        this.setState({ newInstance: false });
      })
      .finally(() => {
        this.setState({
          creating: false,
        });
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
  _getPublicIp = (instance) => {
    if (instance.publicIp) {
      return instance.publicIp;
    }
    return "--";
  };
  _canCreate = () => {
    const { instances } = this.state;
    return !window.MAX_INSTANCES || instances.length < window.MAX_INSTANCES;
  };
  _canTerminate = (instance) => {
    return instance.status.match(/draft|failed|running|timeout/);
  };
  _isLoading = (instance) => {
    return !this._canTerminate(instance);
  };
  render() {
    const {
      ready,
      loading,
      creating,
      newInstance,
      auth,
      instances,
      regionOptions,
      instanceOptions,
      formData,
    } = this.state;
    if (!ready) {
      return <Loading full />;
    }
    return (
      <Container>
        <Header>
          <h1>Jitsi Provisioner</h1>
          {auth && instances.length ? (
            <p>
              <Button
                href="#"
                disabled={!this._canCreate()}
                onClick={this._handleNewClick()}
              >
                New instance
                {window.MAX_INSTANCES ? (
                  <Button.Badge>
                    {instances.length}/{window.MAX_INSTANCES}
                  </Button.Badge>
                ) : null}
              </Button>
            </p>
          ) : null}
          <Spacer />
          {auth ? (
            <p>
              <Button href="#" onClick={this._handleLogoutClick}>
                Logout
              </Button>
            </p>
          ) : null}
          <Info>
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
              Cost estimates provided by{" "}
              <a
                href="https://github.com/powdahound/ec2instances.info"
                target="_blank"
                rel="external"
              >
                ec2instances.info
              </a>
              . The data shown is not guaranteed to be accurate or current.
            </p>
            <p>
              This project is experimental and has no relation to{" "}
              <a href="https://jitsi.org/" rel="external" target="_blank">
                Jitsi.org
              </a>
              .
            </p>
          </Info>
        </Header>
        <Content id="content" ref={this.contentRef}>
          {loading ? (
            <Loading full />
          ) : (
            <>
              {window.DEMO ? (
                <Card info>
                  <Card.Content>
                    <h4>Demo mode is enabled</h4>
                    No instances are actually created.
                  </Card.Content>
                </Card>
              ) : null}
              {!auth ? <Login /> : null}
              <Card.List>
                {auth && (newInstance || !instances.length) ? (
                  <Card.ListItem new loading={creating}>
                    <form onSubmit={this._handleSubmit}>
                      <Card.Header>
                        <h3>New instance</h3>
                        {instances.length ? (
                          <p>
                            <a href="#" onClick={this._handleCloseNewClick}>
                              Cancel
                            </a>
                          </p>
                        ) : null}
                      </Card.Header>
                      <Card.Content>
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
                        <ServerInfo
                          full
                          instance={this._getServer()}
                          region={formData.region}
                        />
                      </Card.Content>
                      <Card.Footer>
                        <Button.Submit
                          disabled={creating}
                          type="submit"
                          value="Create new instance"
                        />
                      </Card.Footer>
                    </form>
                  </Card.ListItem>
                ) : null}
                {instances.map((instance) => (
                  <Card.ListItem
                    key={instance._id}
                    loading={this._isLoading(instance)}
                  >
                    <Card.Header>
                      <h3>{instance.serverName}</h3>
                      {instance.provisionedAt ? (
                        <p>
                          <Timer date={instance.provisionedAt} />
                        </p>
                      ) : null}
                      <p>{instance.status}</p>
                    </Card.Header>
                    <Card.Content>
                      <table>
                        <tr>
                          <th>Region</th>
                          <td>{regions[instance.region]}</td>
                        </tr>
                        <tr>
                          <th>Type</th>
                          <td>{instance.type}</td>
                        </tr>
                        <tr>
                          <th>URL</th>
                          <td>{this._getLink(instance)}</td>
                        </tr>
                        <tr>
                          <th>Public IP</th>
                          <td>{this._getPublicIp(instance)}</td>
                        </tr>
                        <tr>
                          <th>Estimated total cost</th>
                          <td>
                            {instance.provisionedAt ? (
                              <LiveCost
                                date={instance.provisionedAt}
                                hourlyPrice={
                                  this._getServer(instance.type).pricing[
                                    instance.region
                                  ]
                                }
                              />
                            ) : (
                              "--"
                            )}
                          </td>
                        </tr>
                      </table>
                      <ServerInfo
                        instance={this._getServer(instance.type)}
                        region={instance.region}
                      />
                    </Card.Content>
                    <Card.Footer>
                      <Button
                        remove
                        disabled={!this._canTerminate(instance)}
                        href="#"
                        onClick={this._handleRemoveClick(instance)}
                      >
                        Terminate
                      </Button>
                      <Button
                        jitsi
                        disabled={instance.status !== "running"}
                        href={`https://${instance.domain}`}
                        target="_blank"
                        rel="external"
                      >
                        Launch Jitsi
                      </Button>
                    </Card.Footer>
                  </Card.ListItem>
                ))}
              </Card.List>
            </>
          )}
        </Content>
      </Container>
    );
  }
}
