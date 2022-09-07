import React, { Component } from "react";

import Card from "components/Card.jsx";
import { Schema, Form } from "rsuite";
import Button from "components/Button.jsx";

const { StringType } = Schema.Types;

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formData: props.demo ? { username: "admin", password: "admin" } : {},
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
    API.authenticate({
      strategy: "local",
      ...formData,
    })
      .catch((err) => {
        // toaster err.message
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
            {this.props.demo ? (
              <p>
                Authenticate with <strong>admin/admin</strong> or{" "}
                <strong>user/user</strong> credentials.
              </p>
            ) : null}
            <Form.Group controlId="username">
              <Form.ControlLabel>Username</Form.ControlLabel>
              <Form.Control name="username" />
            </Form.Group>
            <Form.Group controlId="password">
              <Form.ControlLabel>Password</Form.ControlLabel>
              <Form.Control name="password" type="password" />
            </Form.Group>
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
