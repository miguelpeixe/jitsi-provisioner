import React, { Component } from "react";
import styled from "styled-components";
import Select from "react-select";

const client = window.API;

import regions from "regions";

import Card from "components/Card.jsx";
import ServerInfo from "components/ServerInfo.jsx";
import Button from "components/Button.jsx";

export default class NewInstance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      valid: true,
      formData: {
        region: "us-east-1",
        type: "t3.large",
      },
    };
    this.service = client.service("instances");
  }
  componentDidUpdate(prevProps, prevState) {
    const { formData } = this.state;
    if (JSON.stringify(prevState.formData) != JSON.stringify(formData)) {
      this.setState({ valid: this._validate() });
    }
  }
  _validate = () => {
    const { formData } = this.state;
    const server = this._getServer();
    if (!server.pricing[formData.region]) {
      return false;
    }
    return true;
  };
  _handleSubmit = (ev) => {
    ev.preventDefault();
    const { formData } = this.state;
    this.setState({
      loading: true,
    });
    this.service
      .create(formData)
      .then((res) => {
        this.setState({ newInstance: false });
        this.props.onSubmit && this.props.onSubmit(res);
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  };
  _handleCancel = (ev) => {
    ev.preventDefault();
    this.props.onCancel && this.props.onCancel();
  };
  _getRegionOptions = () => {
    return Object.keys(regions).map((value) => {
      return {
        label: regions[value],
        value,
      };
    });
  };
  _getInstanceOptions = () => {
    const { instances } = this.props;
    const allOptions = [];
    for (const instance of instances) {
      allOptions.push({
        value: instance._id,
        label: instance._id,
      });
    }
    return [
      {
        label: "Recommended",
        options: [
          {
            label: "t3.large",
            value: "t3.large",
          },
          {
            label: "r5d.2xlarge",
            value: "r5d.2xlarge",
          },
        ],
      },
      {
        label: "All options",
        options: allOptions,
      },
    ];
  };
  _getTypeValue = () => {
    const { formData } = this.state;
    return { label: formData.type, value: formData.type };
  };
  _getRegionValue = () => {
    const regionOptions = this._getRegionOptions();
    const { formData } = this.state;
    const option = regionOptions.find(
      (option) => formData.region == option.value
    );
    return option;
  };
  _getServer = () => {
    const { instances } = this.props;
    const instance = this.state.formData.type;
    if (!instances.length || !instance) return;
    return instances.find((item) => item._id == instance);
  };
  render() {
    const { allowCancel } = this.props;
    const { loading, valid, formData } = this.state;
    return (
      <Card new loading={loading}>
        <form onSubmit={this._handleSubmit}>
          <Card.Header>
            <h3>New instance</h3>
            {allowCancel ? (
              <p>
                <a href="#" onClick={this._handleCancel}>
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
                    options={this._getRegionOptions()}
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
                    options={this._getInstanceOptions()}
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
              disabled={loading || !valid}
              type="submit"
              value="Create new instance"
            />
          </Card.Footer>
        </form>
      </Card>
    );
  }
}
