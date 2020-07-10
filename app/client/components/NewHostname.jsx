import React, { Component } from "react";
import styled from "styled-components";
import Select from "react-select";

const client = window.API;

import regions from "regions";

import Card from "components/Card.jsx";
import HostnameInput from "components/HostnameInput.jsx";
import Button from "components/Button.jsx";

export default class NewHostname extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      valid: true,
      formData: {
        region: "us-east-1",
        hostname: "",
      },
    };
    this.service = client.service("hostnames");
  }
  componentDidUpdate(prevProps, prevState) {
    const { formData } = this.state;
    if (JSON.stringify(prevState.formData) != JSON.stringify(formData)) {
      this.setState({ valid: this._validate() });
    }
  }
  _validate = () => {
    const { formData } = this.state;
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
  _getRegionValue = () => {
    const regionOptions = this._getRegionOptions();
    const { formData } = this.state;
    const option = regionOptions.find(
      (option) => formData.region == option.value
    );
    return option;
  };
  render() {
    const { loading, valid, formData } = this.state;
    return (
      <Card new loading={loading}>
        <form onSubmit={this._handleSubmit}>
          <Card.Header>
            <h3>New hostname</h3>
            <p>
              <a href="#" onClick={this._handleCancel}>
                Cancel
              </a>
            </p>
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
                <th>Hostname</th>
                <td>
                  <HostnameInput
                    onChange={({ target }) => {
                      this.setState({
                        formData: {
                          ...formData,
                          hostname: target.value,
                        },
                      });
                    }}
                    value={formData.hostname}
                  />
                </td>
              </tr>
            </table>
          </Card.Content>
          <Card.Footer>
            <Button.Submit
              disabled={loading || !valid}
              type="submit"
              value="Create new hostname"
            />
          </Card.Footer>
        </form>
      </Card>
    );
  }
}
