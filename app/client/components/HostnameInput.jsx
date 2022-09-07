import React, { Component } from "react";
import styled from "styled-components";
import { Input, InputGroup } from "rsuite";

export default class HostnameInput extends Component {
  static defaultProps = {
    value: "",
    domain: "example.com",
  };
  _handleChange = (value) => {
    const { domain, onChange } = this.props;
    if (domain) {
      const subdomain = value.replace(`.${domain}`, "");
      if (subdomain) {
        value = `${value}.${domain}`;
      }
    }
    onChange && onChange(value);
  };
  _getValue = () => {
    const { value, domain } = this.props;
    if (domain) {
      const subdomain = value.replace(`.${domain}`, "");
      if (subdomain) {
        return subdomain;
      }
      return "";
    }
    return value;
  };
  render() {
    const { name, domain } = this.props;
    return (
      <InputGroup>
        <Input
          name={name}
          placeholder="my-jitsi-server"
          onChange={this._handleChange}
          autoCapitalize="none"
          value={this._getValue()}
        />
        <InputGroup.Addon>.{domain}</InputGroup.Addon>
      </InputGroup>
    );
  }
}
