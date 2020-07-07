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
  input:last-child[type="text"],
  input:last-child[type="password"] {
    margin: 0;
  }
`;

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      username: window.DEMO ? "admin" : "",
      password: window.DEMO ? "admin" : "",
    };
  }
  auth = () => {
    const { username, password } = this.state;
    this.setState({
      loading: true,
    });
    client
      .authenticate({
        strategy: "local",
        username,
        password,
      })
      .catch((err) => {
        console.error(err.message);
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
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
    const { loading, username, password } = this.state;
    return (
      <Card loading={loading}>
        <Container onSubmit={this._handleSubmit}>
          <Card.Header>
            <h3>Authenticate</h3>
          </Card.Header>
          <Card.Content>
            {window.DEMO ? (
              <p>
                Authenticate with <strong>admin/admin</strong> credentials.
              </p>
            ) : null}
            <input
              type="text"
              name="username"
              onChange={this._handleChange}
              placeholder="Username"
              autocapitalize="none"
              value={username}
            />
            <input
              type="password"
              name="password"
              onChange={this._handleChange}
              placeholder="Password"
              value={password}
            />
          </Card.Content>
          <Card.Footer>
            <Button.Submit type="submit" value="Login" disabled={loading} />
          </Card.Footer>
        </Container>
      </Card>
    );
  }
}
