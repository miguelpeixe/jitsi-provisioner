import React, { Component } from "react";
import styled from "styled-components";

import client from "api";

import Card from "components/Card.jsx";
import {
  Schema,
  Alert,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
} from "rsuite";
import Button from "components/Button.jsx";

const { StringType } = Schema.Types;

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formData: DEMO ? { username: "admin", password: "admin" } : {},
    };
    this.model = Schema.Model({
      username: StringType().isRequired("Username is required"),
      password: StringType().isRequired("Password is required"),
    });
  }
  auth = () => {
    const { formData } = this.state;
    this.setState({
      loading: true,
    });
    client
      .authenticate({
        strategy: "local",
        ...formData,
      })
      .catch((err) => {
        Alert.error(err.message);
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  };
  _handleSubmit = (check) => {
    if (check && !this.state.loading) {
      this.auth();
    }
  };
  _handleFormChange = (formData) => {
    this.setState({ formData });
  };
  render() {
    const { loading, formData } = this.state;
    return (
      <Card loading={loading ? 1 : 0}>
        <Form
          fluid
          model={this.model}
          onSubmit={this._handleSubmit}
          formValue={formData}
          onChange={this._handleFormChange}
        >
          <Card.Header>
            <h3>Authenticate</h3>
          </Card.Header>
          <Card.Content>
            {DEMO ? (
              <p>
                Authenticate with <strong>admin/admin</strong> or{" "}
                <strong>user/user</strong> credentials.
              </p>
            ) : null}
            <FormGroup controlId="username">
              <ControlLabel>Username</ControlLabel>
              <FormControl name="username" />
            </FormGroup>
            <FormGroup controlId="password">
              <ControlLabel>Password</ControlLabel>
              <FormControl name="password" type="password" />
            </FormGroup>
          </Card.Content>
          <Card.Footer>
            <Button type="submit" block disabled={loading}>
              Login
            </Button>
          </Card.Footer>
        </Form>
      </Card>
    );
  }
}
