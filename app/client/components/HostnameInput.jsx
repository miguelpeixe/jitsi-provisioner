import React, { Component } from "react";
import styled from "styled-components";

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
  _handleChange = ({ target }) => {
    const value = DOMAIN ? `${target.value}.${DOMAIN}` : target.value;
    this.props.onChange &&
      this.props.onChange({
        target: {
          name: this.props.name,
          value,
        },
      });
  };
  _getValue = () => {
    const { value } = this.props;
    if (DOMAIN) {
      return value.replace(`.${DOMAIN}`, "");
    }
    return value;
  };
  render() {
    const { name, value, placeholder } = this.props;
    if (!DOMAIN) {
      return (
        <input
          type="text"
          name={name}
          placeholder="my-jitsi.meet.example.com"
          onChange={this._handleChange}
          value={this._getValue()}
        />
      );
    } else {
      return (
        <Container>
          <div>
            <input
              type="text"
              name={name}
              placeholder="my-jitsi-server"
              onChange={this._handleChange}
              value={this._getValue()}
            />
            <span>.{DOMAIN}</span>
          </div>
        </Container>
      );
    }
  }
}
