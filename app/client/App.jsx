import React, { Component } from "react";
import styled, { css } from "styled-components";

// import client from "feathers";
const client = window.API;

import Content from "components/Content.jsx";
import Loading from "components/Loading.jsx";
import Button from "components/Button.jsx";
import Card from "components/Card.jsx";
import Login from "components/Login.jsx";
import NewInstance from "components/NewInstance.jsx";
import InstanceList from "components/InstanceList.jsx";

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
  padding: 2rem;
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
  @media (max-width: 370px) {
    font-size: 0.8em;
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
      newInstance: false,
      // data
      auth: null,
      instances: [],
      awsInstances: [],
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
    this.contentRef.current.base.scrollTop = 0;
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
      ready,
      loading,
      newInstance,
      awsInstances,
      auth,
      instances,
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
