import React, { Component } from "react";

const moment = require("moment");

export default class LiveCost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: this.getText(props.date, props.hourlyPrice),
    };
  }
  getText(date, hourlyPrice) {
    const now = moment();
    const provisioned = moment(date);
    const diff = now.diff(provisioned, "hours", true);
    if (diff > 0) {
      return "$" + (hourlyPrice * diff).toFixed(5);
    } else {
      return "$0.00000";
    }
  }
  componentDidMount() {
    const { date, hourlyPrice } = this.props;
    this.timer = setInterval(() => {
      this.setState({ text: this.getText(date, hourlyPrice) });
    }, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  render() {
    return <span>{this.state.text}</span>;
  }
}
