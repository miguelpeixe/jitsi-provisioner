import React, { Component } from "react";
import styled from "styled-components";
import { Input, InputGroup } from "rsuite";

const Container = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.2);
  background: #fff;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  text-align: left;
  > div {
    display: block;
    width: 100%;
    position: relative;
    input[type="text"] {
      width: auto;
      padding: 0;
      border: 0;
    }
    span {
      position: absolute;
      top: 0;
      right: 0;
      padding-left: 0.25rem;
      background: #fff;
    }
  }
`;

export default class HostnameInput extends Component {
  static defaultProps = {
    value: "",
  };
  _handleChange = (value) => {
    if (DOMAIN) {
      const subdomain = value.replace(`.${DOMAIN}`, "");
      if (subdomain) {
        value = `${value}.${DOMAIN}`;
      }
    }
    this.props.onChange && this.props.onChange(value);
  };
  _getValue = () => {
    const { value } = this.props;
    if (DOMAIN) {
      const subdomain = value.replace(`.${DOMAIN}`, "");
      if (subdomain) {
        return subdomain;
      }
      return "";
    }
    return value;
  };
  render() {
    const { name, value, placeholder } = this.props;
    return (
      <InputGroup>
        <Input
          name={name}
          placeholder={DOMAIN ? "my-jitsi-server" : "jitsi.example.com"}
          onChange={this._handleChange}
          autoCapitalize="none"
          value={this._getValue()}
        />
        {DOMAIN ? <InputGroup.Addon>.{DOMAIN}</InputGroup.Addon> : null}
      </InputGroup>
    );
  }
}
