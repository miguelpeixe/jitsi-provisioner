import React, { Component } from "react";

const moment = require("moment");

export default class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: this.getText(props.date),
    };
  }
  getText(d) {
    const now = Date.now();
    const date = new Date(d).getTime();
    if (now - date < 60000) {
      return `${Math.round((now - date) / 1000)} seconds`;
    } else {
      return moment(this.props.date).fromNow(true);
    }
  }
  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({ text: this.getText(this.props.date) });
    }, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  render() {
    return <span>{this.state.text}</span>;
  }
}
