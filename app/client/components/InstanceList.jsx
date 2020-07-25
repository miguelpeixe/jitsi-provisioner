import React, { Component } from "react";
import { Alert, Icon } from "rsuite";
import { get } from "lodash";

import Instances from "api/instances";

import regions from "utils/regions";
import download from "utils/download";

import Card from "components/Card.jsx";
import FlexTable from "components/FlexTable.jsx";
import ServerInfo from "components/ServerInfo.jsx";
import StatusBadge from "components/StatusBadge.jsx";
import Button from "components/Button.jsx";
import Timer from "components/Timer.jsx";
import EstimatedCost from "components/EstimatedCost.jsx";

export default class InstanceList extends Component {
  _handleTerminateClick = (instance) => (ev) => {
    ev.preventDefault();
    if (this._canTerminate(instance) && confirm("Are you sure?")) {
      Instances.terminate(instance).catch((err) => {
        Alert.error(err.message);
      });
    }
  };
  _handleProvisionClick = (instance) => (ev) => {
    ev.preventDefault();
    if (this._canRemove(instance)) {
      Instances.provision(instance).catch((err) => {
        Alert.error(err.message);
      });
    }
  };
  _handleRemoveClick = (instance) => (ev) => {
    ev.preventDefault();
    if (this._canRemove(instance) && confirm("Are you sure?")) {
      Instances.remove(instance).catch((err) => {
        Alert.error(err.message);
      });
    }
  };
  _getLink = (instance) => {
    if (instance.status == "available") {
      const url = Instances.getUrl(instance);
      return (
        <a href={url} rel="external" target="_blank">
          {url}
        </a>
      );
    }
    return "--";
  };
  _canTerminate = (instance) => {
    return instance.status.match(/failed|running|available|standby/);
  };
  _canRemove = (instance) => {
    return instance.status == "terminated";
  };
  _isLoading = (instance) => {
    return (
      !this._canTerminate(instance) && !instance.status.match(/terminated/)
    );
  };
  _handleDownloadClick = (instance) => (ev) => {
    ev.preventDefault();
    Instances.download(instance);
  };
  render() {
    const { awsInstances, instances } = this.props;
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
              {instance.info ? <p>{instance.info}</p> : null}
              <StatusBadge status={instance.status} />
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
                  <FlexTable.Data>{instance.publicIp || "--"}</FlexTable.Data>
                </FlexTable.Row>
                <FlexTable.Row>
                  <FlexTable.Head>Estimated cost</FlexTable.Head>
                  <FlexTable.Data>
                    <EstimatedCost instance={instance} aws={awsInstances} />
                  </FlexTable.Data>
                </FlexTable.Row>
              </FlexTable>
              <ServerInfo
                instance={Instances.getServer(instance.type)}
                region={instance.region}
              />
              <Button.Group vertical>
                <Button
                  block
                  light
                  small
                  onClick={this._handleDownloadClick(instance)}
                >
                  Download configuration
                </Button>
                {instance.status == "available" &&
                Instances.hasRecording(instance) ? (
                  <Button
                    block
                    light
                    small
                    href={`${Instances.getUrl(instance)}/${
                      instance.api.key
                    }/recordings`}
                    target="_blank"
                    rel="external"
                  >
                    Download recordings
                  </Button>
                ) : null}
              </Button.Group>
            </Card.Content>
            <Card.Footer>
              {instance.status !== "terminated" ? (
                <Button.Group>
                  <Button
                    remove
                    disabled={!this._canTerminate(instance)}
                    onClick={this._handleTerminateClick(instance)}
                  >
                    Terminate
                  </Button>
                  <Button
                    jitsi
                    disabled={instance.status !== "available"}
                    href={Instances.getUrl(instance)}
                    target="_blank"
                    rel="external"
                  >
                    Launch Jitsi
                  </Button>
                </Button.Group>
              ) : (
                <Button.Group>
                  <Button
                    remove
                    disabled={!this._canRemove(instance)}
                    onClick={this._handleRemoveClick(instance)}
                  >
                    Remove
                  </Button>
                  <Button
                    disabled={!this._canRemove(instance)}
                    onClick={this._handleProvisionClick(instance)}
                  >
                    Provision instance
                  </Button>
                </Button.Group>
              )}
            </Card.Footer>
          </Card.ListItem>
        ))}
      </Card.List>
    );
  }
}
