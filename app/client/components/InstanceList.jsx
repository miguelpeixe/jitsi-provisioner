import React, { Component } from "react";
import { Alert, Icon } from "rsuite";
import { get } from "lodash";
import { regions } from "@jitsi-provisioner/aws-utils";

import Instances from "api/instances";

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
    if (Instances.canTerminate(instance) && confirm("Are you sure?")) {
      Instances.terminate(instance).catch((err) => {
        Alert.error(err.message);
      });
    }
  };
  _handleProvisionClick = (instance) => (ev) => {
    ev.preventDefault();
    if (Instances.canRemove(instance)) {
      Instances.provision(instance).catch((err) => {
        Alert.error(err.message);
      });
    }
  };
  _handleRemoveClick = (instance) => (ev) => {
    ev.preventDefault();
    if (Instances.canRemove(instance) && confirm("Are you sure?")) {
      Instances.remove(instance).catch((err) => {
        Alert.error(err.message);
      });
    }
  };
  _getLink = (instance) => {
    if (Instances.isAvailable(instance)) {
      const url = Instances.getUrl(instance);
      return (
        <a href={url} rel="external" target="_blank">
          {url}
        </a>
      );
    }
    return "--";
  };
  _handleDownloadClick = (instance) => (ev) => {
    ev.preventDefault();
    Instances.download(instance);
  };
  render() {
    const { instances } = this.props;
    if (!instances || !instances.length) return null;
    return (
      <Card.List>
        {instances.map((instance) => (
          <Card.ListItem
            key={instance._id}
            loading={Instances.isLoading(instance)}
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
                    <EstimatedCost instance={instance} />
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
                {Instances.isAvailable(instance) &&
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
              {Instances.isRunning(instance) ? (
                <Button.Group>
                  <Button
                    remove
                    disabled={!Instances.canTerminate(instance)}
                    onClick={this._handleTerminateClick(instance)}
                  >
                    Terminate
                  </Button>
                  <Button
                    jitsi
                    disabled={!Instances.isAvailable(instance)}
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
                    disabled={!Instances.canRemove(instance)}
                    onClick={this._handleRemoveClick(instance)}
                  >
                    Remove
                  </Button>
                  <Button
                    disabled={!Instances.canRemove(instance)}
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
