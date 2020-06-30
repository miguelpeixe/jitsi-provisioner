import React, { Component } from "react";
import styled from "styled-components";

// import client from "feathers";
const client = window.API;

import Card from "components/Card.jsx";
import Button from "components/Button.jsx";

const Container = styled.form`
  input[type="text"],
  input[type="password"] {
    border: 1px solid #ddd;
    display: block;
    width: 100%;
    padding: 1rem;
    box-sizing: border-box;
    border-radius: 4px;
    margin: 0 0 1rem;
  }
`;

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
    };
  }
  auth = () => {
    const { username, password } = this.state;
    client
      .authenticate({
        strategy: "local",
        username,
        password,
      })
      .catch((err) => {
        console.log("with credentials", err);
      });
  };
  _handleSubmit = (ev) => {
    ev.preventDefault();
    this.auth();
  };
  _handleChange = ({ target }) => {
    this.setState({ [target.name]: target.value });
  };
  render() {
    return (
      <Card>
        <Container onSubmit={this._handleSubmit}>
          <Card.Header>
            <h3>Login</h3>
          </Card.Header>
          <Card.Content>
            <input
              type="text"
              name="username"
              onChange={this._handleChange}
              placeholder="Username"
              autocapitalize="none"
            />
            <input
              type="password"
              name="password"
              onChange={this._handleChange}
              placeholder="Password"
            />
          </Card.Content>
          <Card.Footer>
            <Button.Submit type="submit" value="Login" />
          </Card.Footer>
        </Container>
      </Card>
    );
  }
}
