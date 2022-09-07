import React, { Component } from "react";
import { Schema, Form, Tooltip, Whisper, Toggle, InputPicker } from "rsuite";
import { Icon } from "@rsuite/icons";
import { pickBy } from "lodash";

import { FaQuestionCircle, FaCube } from "react-icons/fa";

import { FaServer } from "react-icons/fa";

import Card from "components/Card.jsx";
import Button from "components/Button.jsx";
import FlexTable from "components/FlexTable.jsx";
import ServerInfo from "components/ServerInfo.jsx";
import HostnameInput from "components/HostnameInput.jsx";

const { StringType } = Schema.Types;

function Explain({ children }) {
  const tooltip = <Tooltip>{children}</Tooltip>;
  return (
    <Whisper placement="top" trigger="hover" speaker={tooltip}>
      <Icon as={FaQuestionCircle} />
    </Whisper>
  );
}

export default class InstanceNew extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      valid: true,
      awsInstances: [],
      regions: API.aws.regions(),
      formData: {
        hostname: "",
        region: "us-east-1",
        type: "t3.large",
      },
    };
    this.model = Schema.Model({
      hostname: StringType(),
      region: StringType().isRequired("AWS region is required"),
      type: StringType().isRequired("Instance type is required"),
    });
  }
  componentDidMount() {
    API.aws.getInstances().then((data) => {
      this.setState({ awsInstances: data });
    });
  }
  componentDidUpdate(prevProps, prevState) {
    const { formData } = this.state;
    if (JSON.stringify(prevState.formData) != JSON.stringify(formData)) {
      this._validate().then((valid) => {
        this.setState({ valid });
      });
    }
  }
  _validate = async () => {
    const { formData } = this.state;
    const server = await API.aws.getServer(formData.type);
    if (!server.pricing[formData.region]) {
      return false;
    }
    return true;
  };
  _handleSubmit = () => {
    const { formData } = this.state;
    this.setState({
      loading: true,
    });
    if (formData.createAMI) {
      API.instances.createAMI(formData.region);
      delete formData.createAMI;
    }
    API.instances
      .create(pickBy(formData))
      .then((res) => {
        this.props.onSubmit && this.props.onSubmit(res);
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
  _handleCancel = (ev) => {
    ev.preventDefault();
    this.props.onCancel && this.props.onCancel();
  };
  _getRegionOptions = () => {
    const { regions } = this.state;
    return Object.keys(regions).map((value) => {
      return {
        label: regions[value],
        value,
      };
    });
  };
  _getInstanceOptions = () => {
    const aws = this.state.awsInstances;
    const options = [];
    for (const instance of aws) {
      options.push({
        value: instance._id,
        label: instance._id,
        group: instance._id.match(/t3.large|r5d.2xlarge|c5d.2xlarge/)
          ? "Recommended"
          : "All",
      });
    }
    return options;
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
  _hasAmi = () => {
    const { amis } = this.props;
    const { formData } = this.state;
    return amis.find(
      (ami) => ami.region == formData.region && ami.status == "active"
    );
  };
  _handleFormChange = (formData) => {
    this.setState({ formData });
  };
  render() {
    const { allowCancel } = this.props;
    const { loading, valid, formData } = this.state;
    let awsInstance;
    API.aws.getServer(formData.type).then((data) => {
      awsInstance = data;
    });
    return (
      <Card new loading={loading ? 1 : 0}>
        <Form
          model={this.model}
          onSubmit={this._handleSubmit}
          onChange={this._handleFormChange}
          formValue={formData}
        >
          <Card.Header>
            <Icon as={FaServer} />
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
              <tbody>
                <tr>
                  <th>Hostname</th>
                  <td>
                    <Form.Control
                      name="hostname"
                      accepter={HostnameInput}
                      domain={this.props.domain}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Region</th>
                  <td>
                    <Form.Control
                      accepter={InputPicker}
                      name="region"
                      block
                      cleanable={false}
                      data={this._getRegionOptions()}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Type</th>
                  <td>
                    <Form.Control
                      accepter={InputPicker}
                      name="type"
                      block
                      cleanable={false}
                      data={this._getInstanceOptions()}
                      groupBy="group"
                      sort={(isGroup) => {
                        if (isGroup) {
                          return (a, b) => {
                            if (a.groupTitle == "Recommended") {
                              return -1;
                            }
                            return 1;
                          };
                        }
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <ServerInfo full type={formData.type} region={formData.region} />
            <FlexTable>
              {!this._hasAmi() ? (
                <FlexTable.Row>
                  <FlexTable.Head>
                    <Icon as={FaCube} /> Create AMI{" "}
                    <Explain>
                      Create a base image in this region, allowing faster deploy
                      for future instances.
                    </Explain>
                  </FlexTable.Head>
                  <FlexTable.Data>
                    <Form.Control accepter={Toggle} name="createAMI" />
                  </FlexTable.Data>
                </FlexTable.Row>
              ) : null}
              <FlexTable.Row>
                <FlexTable.Head>Enable recording</FlexTable.Head>
                <FlexTable.Data>
                  <Form.Control accepter={Toggle} name="recording" />
                </FlexTable.Data>
              </FlexTable.Row>
            </FlexTable>
          </Card.Content>
          <Card.Footer>
            <Button type="submit" block disabled={loading || !valid}>
              Create new instance
            </Button>
          </Card.Footer>
        </Form>
      </Card>
    );
  }
}
