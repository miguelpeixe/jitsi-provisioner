import React, { Component } from "react";
import ReactDOM from "react-dom";
import styled, { css } from "styled-components";
import { Alert, Loader, Icon } from "rsuite";

import Container from "components/Container.jsx";
import Header from "components/Header.jsx";
import Info from "components/Info.jsx";
import Content from "components/Content.jsx";
import Spacer from "components/Spacer.jsx";
import Button from "components/Button.jsx";
import Card from "components/Card.jsx";
import Login from "components/Login.jsx";
import InstanceNew from "components/InstanceNew.jsx";
import RegionList from "components/RegionList.jsx";
import InstanceList from "components/InstanceList.jsx";

Alert.config({
  top: "1rem",
});

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
      aws: [],
      amis: [],
      instances: [],
    };
    this.service = API.instances;
    this.contentRef = React.createRef();
  }
  componentDidMount() {
    if (localStorage.accessToken) {
      API.reAuthenticate()
        .catch((err) => {
          API.logout();
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
    API.on("login", (auth) => {
      this.setState({ auth });
      this._fetchInstances();
      this._fetchAMIs();
    });
    API.on("logout", () => {
      this.setState({ auth: false, instances: [], amis: [], aws: [] });
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
    API.service("amis").on("created", (ami) => {
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
    API.service("amis").on("patched", (ami) => {
      const amis = [...this.state.amis];
      const idx = amis.findIndex((i) => i._id == ami._id);
      if (Number.isInteger(idx) && idx > -1) {
        amis[idx] = ami;
        this.setState({ amis });
      }
    });
    API.service("amis").on("removed", (ami) => {
      if (ami.status == "removing") return;
      const amis = [...this.state.amis];
      const idx = amis.findIndex((i) => i._id == ami._id);
      if (Number.isInteger(idx) && idx > -1) {
        amis.splice(idx, 1);
        this.setState({ amis });
      }
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
    API.service("amis")
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
    API.logout();
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
    const { loading, ready, auth, newInstance, amis, instances } = this.state;
    if (!ready) {
      return <Loader center size="md" inverse />;
    }
    return (
      <Container>
        <Header>
          <h1>Jitsi Provisioner</h1>
          {auth && auth.user.role == "admin" && instances.length ? (
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
            {auth && auth.user.role == "admin" ? (
              <RegionList amis={amis} instances={instances} />
            ) : null}
          </Spacer>
          {auth ? (
            <p>
              <Button onClick={this._handleLogoutClick}>Logout</Button>
            </p>
          ) : null}
          {auth && auth.user.role == "admin" ? <Info /> : null}
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
                <InstanceNew
                  allowCancel={instances.length}
                  onSubmit={this._handleSubmit}
                  onCancel={this._handleCancel}
                  amis={amis}
                />
              ) : null}
              <InstanceList instances={instances} />
            </>
          )}
        </Content>
      </Container>
    );
  }
}
