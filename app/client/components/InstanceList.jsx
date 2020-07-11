import React, { Component } from "react";
import { Icon } from "rsuite";

import client from "api";

import regions from "regions";
import download from "download";

import Card from "components/Card.jsx";
import FlexTable from "components/FlexTable.jsx";
import StatusBadge from "components/StatusBadge.jsx";
import ServerInfo from "components/ServerInfo.jsx";
import Button from "components/Button.jsx";
import Timer from "components/Timer.jsx";
import LiveCost from "components/LiveCost.jsx";

export default class InstanceList extends Component {
  constructor(props) {
    super(props);
    this.service = client.service("instances");
  }
  _handleRemoveClick = (instance) => (ev) => {
    ev.preventDefault();
    if (this._canTerminate(instance)) {
      this.service.remove(instance._id);
    }
  };
  _getLink = (instance) => {
    if (instance.status == "running") {
      const url = `https://${instance.hostname}`;
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
    if (instance.terraform.state.terraform_version) {
      return instance.terraform.state.resources.find(
        (resource) => resource.type == "aws_instance"
      ).instances[0].attributes.public_ip;
    }
    return "--";
  };
  _getServer = (instance) => {
    const { awsInstances } = this.props;
    if (!awsInstances.length || !instance) return;
    return awsInstances.find((item) => item._id == instance);
  };
  _canTerminate = (instance) => {
    return instance.status.match(/draft|failed|running|timeout/);
  };
  _isLoading = (instance) => {
    return !this._canTerminate(instance);
  };
  _handleDownloadClick = (instance) => (ev) => {
    ev.preventDefault();
    client.rest
      .get(`/instances/${instance._id}?download`, { responseType: "blob" })
      .then((res) => {
        download(
          res.data,
          `${instance._id}.tar.gz`,
          res.headers["content-type"]
        );
      });
  };
  render() {
    const { instances } = this.props;
    if (!instances || !instances.length) return null;
    return (
      <Card.List>
        {instances.map((instance) => (
          <Card.ListItem
            key={instance._id}
            loading={this._isLoading(instance) ? 1 : 0}
          >
            <Card.Header>
              <Icon icon="server" />
              <h3>{instance.name}</h3>
              {instance.provisionedAt ? (
                <p>
                  <Timer date={instance.provisionedAt} />
                </p>
              ) : null}
              <p>{instance.status}</p>
              {/* <StatusBadge
                status={
                  instance.status == "running"
                    ? "active"
                    : instance.status.match(/failed|timeout/)
                    ? "error"
                    : "loading"
                }
              /> */}
            </Card.Header>
            <Card.Content>
              <FlexTable>
                <FlexTable.Row>
                  <FlexTable.Head>Region</FlexTable.Head>
                  <FlexTable.Data>{regions[instance.region]}</FlexTable.Data>
                </FlexTable.Row>
                <FlexTable.Row>
                  <FlexTable.Head>Type</FlexTable.Head>
                  <FlexTable.Data>{instance.type}</FlexTable.Data>
                </FlexTable.Row>
                <FlexTable.Row>
                  <FlexTable.Head>URL</FlexTable.Head>
                  <FlexTable.Data>{this._getLink(instance)}</FlexTable.Data>
                </FlexTable.Row>
                <FlexTable.Row>
                  <FlexTable.Head>Public IP</FlexTable.Head>
                  <FlexTable.Data>{this._getPublicIp(instance)}</FlexTable.Data>
                </FlexTable.Row>
                <FlexTable.Row>
                  <FlexTable.Head>Estimated cost</FlexTable.Head>
                  <FlexTable.Data>
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
                  </FlexTable.Data>
                </FlexTable.Row>
              </FlexTable>
              <ServerInfo
                instance={this._getServer(instance.type)}
                region={instance.region}
              />
              <Button
                block
                light
                small
                onClick={this._handleDownloadClick(instance)}
              >
                Download configuration
              </Button>
            </Card.Content>
            <Card.Footer>
              <Button.Group>
                <Button
                  remove={1}
                  disabled={!this._canTerminate(instance)}
                  onClick={this._handleRemoveClick(instance)}
                >
                  Terminate
                </Button>
                <Button
                  jitsi={1}
                  disabled={instance.status !== "running"}
                  href={`https://${instance.hostname}`}
                  target="_blank"
                  rel="external"
                >
                  Launch Jitsi
                </Button>
              </Button.Group>
            </Card.Footer>
          </Card.ListItem>
        ))}
      </Card.List>
    );
  }
}
