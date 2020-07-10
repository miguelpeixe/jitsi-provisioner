import React, { Component } from "react";

import client from "api";

import regions from "regions";

import Card from "components/Card.jsx";
import StatusBadge from "components/StatusBadge.jsx";
import ServerInfo from "components/ServerInfo.jsx";
import Button from "components/Button.jsx";
import Timer from "components/Timer.jsx";
import LiveCost from "components/LiveCost.jsx";

export default class HostnameList extends Component {
  constructor(props) {
    super(props);
    this.service = client.service("hostnames");
  }
  _handleRemoveClick = (hostname) => (ev) => {
    ev.preventDefault();
    if (this._canTerminate(hostname)) {
      this.service.remove(hostname._id);
    }
  };
  _getPublicIp = (hostname) => {
    if (hostname.publicIp) {
      return hostname.publicIp;
    }
    if (hostname.terraform.state.terraform_version) {
      return hostname.terraform.state.resources.find(
        (resource) => resource.type == "aws_eip"
      ).instances[0].attributes.public_ip;
    }
    return "--";
  };
  _canTerminate = (instance) => {
    return instance.status.match(/draft|failed|active|timeout/);
  };
  _isLoading = (instance) => {
    return !this._canTerminate(instance);
  };
  render() {
    const { hostnames } = this.props;
    if (!hostnames || !hostnames.length) return;
    return (
      <Card.List>
        {hostnames.map((hostname) => (
          <Card.ListItem key={hostname._id} loading={this._isLoading(hostname)}>
            <Card.Header>
              <h3>{hostname.name}</h3>
              {hostname.provisionedAt ? (
                <p>
                  <Timer date={hostname.provisionedAt} />
                </p>
              ) : null}
              <p>{hostname.status}</p>
            </Card.Header>
            <Card.Content>
              <table>
                <tr>
                  <th>Region</th>
                  <td>{regions[hostname.region]}</td>
                </tr>
                <tr>
                  <th>Hostname</th>
                  <td>{hostname.hostname}</td>
                </tr>
                <tr>
                  <th>Public IP</th>
                  <td>{this._getPublicIp(hostname)}</td>
                </tr>{" "}
                <tr>
                  <th>Estimated cost</th>
                  <td>
                    {hostname.provisionedAt ? (
                      <LiveCost date={hostname.provisionedAt} hourlyPrice={0.005} />
                    ) : (
                      "--"
                    )}
                  </td>
                </tr>
              </table>
            </Card.Content>
            <Card.Footer>
              <Button
                remove
                disabled={!this._canTerminate(hostname)}
                href="#"
                onClick={this._handleRemoveClick(hostname)}
              >
                Terminate
              </Button>
            </Card.Footer>
          </Card.ListItem>
        ))}
      </Card.List>
    );
  }
}
