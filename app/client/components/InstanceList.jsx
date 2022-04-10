import React, { Component } from "react";
import { Icon } from "@rsuite/icons";
import { FaServer } from "react-icons/fa";

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
    if (API.instances.canTerminate(instance) && confirm("Are you sure?")) {
      API.instances.terminate(instance).catch((err) => {
        // toaster err.message
      });
    }
  };
  _handleProvisionClick = (instance) => (ev) => {
    ev.preventDefault();
    if (API.instances.canRemove(instance)) {
      API.instances.provision(instance).catch((err) => {
        // toaster err.message
      });
    }
  };
  _handleRemoveClick = (instance) => (ev) => {
    ev.preventDefault();
    if (API.instances.canRemove(instance) && confirm("Are you sure?")) {
      API.instances.remove(instance).catch((err) => {
        // toaster err.message
      });
    }
  };
  _getLink = (instance) => {
    if (API.instances.isAvailable(instance)) {
      const url = API.instances.getUrl(instance);
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
    API.instances.download(instance);
  };
  render() {
    const { instances } = this.props;
    if (!instances || !instances.length) return null;
    return (
      <Card.List>
        {instances.map((instance) => (
          <Card.ListItem
            key={instance._id}
            loading={API.instances.isLoading(instance)}
          >
            <Card.Header>
              <Icon as={FaServer} />
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
                  <FlexTable.Data>
                    {API.aws.regions(instance.region)}
                  </FlexTable.Data>
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
              <ServerInfo type={instance.type} region={instance.region} />
              <Button.Group vertical>
                <Button
                  block
                  light
                  small
                  onClick={this._handleDownloadClick(instance)}
                >
                  Download configuration
                </Button>
                {API.instances.isAvailable(instance) &&
                API.instances.hasRecording(instance) ? (
                  <Button
                    block
                    light
                    small
                    href={`${API.instances.getUrl(instance)}/${
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
              {API.instances.isRunning(instance) ? (
                <Button.Group>
                  <Button
                    remove
                    disabled={!API.instances.canTerminate(instance)}
                    onClick={this._handleTerminateClick(instance)}
                  >
                    Terminate
                  </Button>
                  <Button
                    jitsi
                    disabled={!API.instances.isAvailable(instance)}
                    href={API.instances.getUrl(instance)}
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
                    disabled={!API.instances.canRemove(instance)}
                    onClick={this._handleRemoveClick(instance)}
                  >
                    Remove
                  </Button>
                  <Button
                    disabled={!API.instances.canRemove(instance)}
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
