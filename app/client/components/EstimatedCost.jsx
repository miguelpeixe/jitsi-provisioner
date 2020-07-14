import React, { Component } from "react";
import moment from "moment";
import { Icon, Tooltip, Whisper } from "rsuite";

const EIP_HOURLY_COST = 0.005;

export default class EstimatedCost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: this.getText(props.date, props.hourlyPrice),
    };
  }
  getInstanceCost = (region, type) => {
    const { aws } = this.props;
    const instance = aws.find((item) => item._id == type);
    if (instance) {
      return instance.pricing[region];
    }
    return 0;
  };
  getStatusHourlyPrice = (status) => {
    let statusHourlyPrice = 0;
    for (const resource of status.resources) {
      let hourlyPrice;
      switch (resource) {
        case "eip":
          hourlyPrice = EIP_HOURLY_COST;
          break;
        default:
          hourlyPrice = this.getInstanceCost(status.region, resource);
      }
      statusHourlyPrice += hourlyPrice;
    }
    return statusHourlyPrice;
  };
  getHistoricCost = () => {
    const { instance } = this.props;
    let cost = 0;
    if (instance.history) {
      let lastDate = 0;
      const history = instance.history.slice(0).reverse();
      for (const status of history) {
        const statusPrice = this.getStatusHourlyPrice(status);
        if (lastDate) {
          const timeInSeconds =
            (lastDate - new Date(status.date).getTime()) / 1000;
          if (timeInSeconds > 0.9) {
            const statusCost = statusPrice * (timeInSeconds / 3600);
            cost += statusCost;
          }
        }
        lastDate = new Date(status.date).getTime();
      }
    }
    return cost;
  };
  getCurrentStatusCost = () => {
    const { instance } = this.props;

    if (!instance.history || !instance.history.length) return 0;

    const currentStatus = instance.history[instance.history.length - 1];
    const price = this.getStatusHourlyPrice(currentStatus);
    const now = moment();
    const date = moment(currentStatus.date);
    const diff = now.diff(date, "hours", true);
    if (diff > 0) {
      const cost = price * diff;
      return cost;
    }
    return 0;
  };
  getText = () => {
    const historicCost = this.getHistoricCost();
    const currentCost = this.getCurrentStatusCost();

    const totalCost = historicCost + currentCost;

    if (totalCost) {
      return "$" + totalCost.toFixed(5);
    }
    return "--";
  };
  getCurrentStatusName = () => {
    const { instance } = this.props;
    if (!instance.history || !instance.history.length) return false;
    const currentStatus = instance.history[instance.history.length - 1];
    return currentStatus.status;
  };
  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({ text: this.getText() });
    }, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  render() {
    const standbyTooltip = (
      <Tooltip>
        Instance is not running and costs only the allocated EIP ($
        {EIP_HOURLY_COST}/hour)
      </Tooltip>
    );
    return (
      <span>
        {this.state.text}{" "}
        {this.getCurrentStatusName() == "standby" ? (
          <Whisper placement="top" trigger="hover" speaker={standbyTooltip}>
            <Icon icon="info" />
          </Whisper>
        ) : null}
      </span>
    );
  }
}
