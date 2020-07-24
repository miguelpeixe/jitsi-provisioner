import React, { Component } from "react";
import ReactDOM from "react-dom";
import styled, { css } from "styled-components";
import { Alert, Loader, Icon } from "rsuite";

import client from "api";

import Content from "components/Content.jsx";
import Button from "components/Button.jsx";
import Card from "components/Card.jsx";
import Login from "components/Login.jsx";
import NewInstance from "components/NewInstance.jsx";
import RegionList from "components/RegionList.jsx";
import InstanceList from "components/InstanceList.jsx";

import regions from "regions";

Alert.config({
  top: "1rem",
});

const Container = styled.div`
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

const Spacer = styled.div`
  flex: 1 1 100%;
  display: flex;
  align-items: center;
  @media (max-width: 760px) {
    display: none;
  }
`;

const Header = styled.header`
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
  @media (max-width: 1120px) {
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

const Info = styled.aside`
  flex: 0 0 auto;
  color: rgba(255, 255, 255, 0.5);
  @media (max-width: 760px) {
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
      newInstance: false,
      newHostname: false,
      // data
      auth: null,
      amis: [],
      instances: [],
      awsInstances: [],
    };
    this.service = client.service("instances");
    this.contentRef = React.createRef();
  }
  componentDidMount() {
    if (localStorage.auth) {
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
    } else {
      this.setState({
        ready: true,
      });
    }
    client.on("login", (auth) => {
      this.setState({ auth });
      this._fetchAWS();
      this._fetchInstances();
      this._fetchAMIs();
    });
    client.on("logout", () => {
      this.setState({ auth: false, instances: [], amis: [], awsInstances: [] });
    });
    this.bindInstanceEvents();
    this.bindAMIEvents();
  }
  bindInstanceEvents = () => {
    this.service.on("created", (instance) => {
      const instances = [...this.state.instances];
      const idx = instances.findIndex((i) => i._id == instance._id);
      if (Number.isInteger(idx) && idx > -1) {
        instances[idx] = instance;
        this.setState({ instances });
      } else {
        this.setState({
          instances: [instance, ...this.state.instances],
        });
      }
    });
    this.service.on("patched", (instance) => {
      const instances = [...this.state.instances];
      const idx = instances.findIndex((i) => i._id == instance._id);
      if (Number.isInteger(idx) && idx > -1) {
        instances[idx] = instance;
        this.setState({ instances });
      }
    });
    this.service.on("removed", (instance) => {
      const instances = [...this.state.instances];
      const idx = instances.findIndex((i) => i._id == instance._id);
      if (Number.isInteger(idx) && idx > -1) {
        instances.splice(idx, 1);
        this.setState({ instances });
      }
    });
  };
  bindAMIEvents = () => {
    client.service("amis").on("created", (ami) => {
      const amis = [...this.state.amis];
      const idx = amis.findIndex((i) => i._id == ami._id);
      if (Number.isInteger(idx) && idx > -1) {
        amis[idx] = ami;
        this.setState({ amis });
      } else {
        this.setState({
          amis: [ami, ...this.state.amis],
        });
      }
    });
    client.service("amis").on("patched", (ami) => {
      const amis = [...this.state.amis];
      const idx = amis.findIndex((i) => i._id == ami._id);
      if (Number.isInteger(idx) && idx > -1) {
        amis[idx] = ami;
        this.setState({ amis });
      }
    });
    client.service("amis").on("removed", (ami) => {
      if (ami.status == "removing") return;
      const amis = [...this.state.amis];
      const idx = amis.findIndex((i) => i._id == ami._id);
      if (Number.isInteger(idx) && idx > -1) {
        amis.splice(idx, 1);
        this.setState({ amis });
      }
    });
  };
  _fetchAWS = () => {
    client
      .service("aws")
      .find()
      .then((data) => {
        let allOptions = [];
        this.setState({ awsInstances: data });
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
  _fetchAMIs = () => {
    this.setState({
      loading: true,
    });
    client
      .service("amis")
      .find({
        query: {
          $sort: {
            createdAt: -1,
          },
        },
      })
      .then((amis) => {
        this.setState({ amis });
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  };
  _handleLogoutClick = (ev) => {
    ev.preventDefault();
    client.logout();
  };
  _canCreate = () => {
    const { instances } = this.state;
    return !window.MAX_INSTANCES || instances.length < window.MAX_INSTANCES;
  };
  _handleNewClick = () => (ev) => {
    ev.preventDefault();
    if (!this._canCreate()) return;
    this.setState({ newInstance: true });
    ReactDOM.findDOMNode(this.contentRef.current).scrollTop = 0;
  };
  _handleSubmit = (ev) => {
    if (ev && ev.preventDefault) ev.preventDefault();
    this.setState({ newInstance: false });
  };
  _handleCancel = (ev) => {
    if (ev && ev.preventDefault) ev.preventDefault();
    this.setState({ newInstance: false });
  };
  render() {
    const {
      loading,
      ready,
      auth,
      newInstance,
      awsInstances,
      amis,
      instances,
    } = this.state;
    if (!ready) {
      return <Loader center size="md" inverse />;
    }
    return (
      <Container>
        <Header>
          <h1>Jitsi Provisioner</h1>
          {auth && instances.length ? (
            <Button
              disabled={!this._canCreate()}
              onClick={this._handleNewClick()}
            >
              New instance
              {MAX_INSTANCES ? (
                <Button.Badge>
                  {instances.length}/{MAX_INSTANCES}
                </Button.Badge>
              ) : null}
            </Button>
          ) : null}
          <Spacer>
            <RegionList amis={amis} instances={instances} />
          </Spacer>
          {auth ? (
            <p>
              <Button onClick={this._handleLogoutClick}>Logout</Button>
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
            <p>
              <a
                href="https://github.com/miguelpeixe/jitsi-provisioner"
                target="_blank"
                rel="external"
              >
                <Icon size="2x" icon="github" />
              </a>
            </p>
          </Info>
        </Header>
        <Content id="content" ref={this.contentRef}>
          {loading ? (
            <Loader center size="md" inverse />
          ) : (
            <>
              {window.DEMO ? (
                <Card info>
                  <Card.Content>
                    <h4>Demo mode is enabled</h4>
                    <p>Fake data is generated and no instance is deployed.</p>
                  </Card.Content>
                </Card>
              ) : null}
              {!auth ? <Login /> : null}
              {auth && (newInstance || !instances.length) ? (
                <NewInstance
                  allowCancel={instances.length}
                  onSubmit={this._handleSubmit}
                  onCancel={this._handleCancel}
                  instances={awsInstances}
                  amis={amis}
                />
              ) : null}
              <InstanceList instances={instances} awsInstances={awsInstances} />
            </>
          )}
        </Content>
      </Container>
    );
  }
}
