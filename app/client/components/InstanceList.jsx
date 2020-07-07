import React, { Component } from "react";

const client = window.API;

import regions from "regions";
import download from "download";

import Card from "components/Card.jsx";
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
    if (!instances || !instances.length) return;
    return (
      <Card.List>
        {instances.map((instance) => (
          <Card.ListItem key={instance._id} loading={this._isLoading(instance)}>
            <Card.Header>
              <h3>{instance.name}</h3>
              {instance.provisionedAt ? (
                <p>
                  <Timer date={instance.provisionedAt} />
                </p>
              ) : null}
              <p>{instance.status}</p>
              <StatusBadge
                status={
                  instance.status == "running"
                    ? "active"
                    : instance.status.match(/failed|timeout/)
                    ? "error"
                    : "loading"
                }
              />
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
                  <th>Estimated cost</th>
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
              <nav>
                <Button
                  small
                  light
                  href="#"
                  onClick={this._handleDownloadClick(instance)}
                >
                  Download config and SSH keys
                </Button>
              </nav>
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
                href={`https://${instance.hostname}`}
                target="_blank"
                rel="external"
              >
                Launch Jitsi
              </Button>
            </Card.Footer>
          </Card.ListItem>
        ))}
      </Card.List>
    );
  }
}
