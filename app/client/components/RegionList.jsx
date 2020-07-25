import React, { Component } from "react";
import styled from "styled-components";

import client from "api";

import regions from "utils/regions";

import { Alert, Icon, Tooltip, Whisper } from "rsuite";

import Button from "components/Button.jsx";
import StatusBadge from "components/StatusBadge.jsx";

const Container = styled.section`
  flex: 1 1 auto;
  display: block;
  font-size: 0.8em;
  text-align: right;
  margin: 0 -2rem 2rem;
  padding: 2rem;
  h2 {
    font-size: 1.2em;
    font-weight: 600;
    margin: 0 0 1rem;
    line-height: inherit;
  }
  > div {
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    h3 {
      font-size: 1em;
      line-height: inherit;
      margin: 0 0.8rem 0 0;
      color: rgba(255, 255, 255, 0.8);
    }
  }
`;

const Resources = styled.div`
  display: flex;
  margin: 0 -0.3rem;
  font-size: 0.8em;
  > a,
  > span {
    flex: 0 0 auto;
    margin: 0 0.3rem;
    position: relative;
    color: rgba(255, 255, 255, 0.1);
    i {
      color: rgba(255, 255, 255, 0.1);
    }
  }
`;

const Badge = styled.span`
  position: absolute;
  display: block;
  border-radius: 100%;
  width: 13px;
  height: 13px;
  line-height: 13px;
  background: #252a34;
  color: #fff;
  bottom: 0;
  right: 0;
  margin-bottom: -2px;
  margin-right: -4px;
  font-weight: 600;
  text-align: center;
`;

Resources.AMI = function ({ ami, region }) {
  const style = {};
  if (ami && ami.status == "active") {
    style.color = "#05ff7e";
  }
  if (ami && ami.status == "failed") {
    style.color = "#ff2e2e";
  }
  const tooltip = <Tooltip>AMI</Tooltip>;
  return (
    <a
      href="#"
      onClick={(ev) => {
        ev.preventDefault();
        if (!ami) {
          client
            .service("amis")
            .create({ region })
            .catch((err) => {
              Alert.error(err.message);
            });
        } else if (ami.status.match(/failed|active/)) {
          client
            .service("amis")
            .remove(ami._id)
            .catch((err) => {
              Alert.error(err.message);
            });
        }
      }}
    >
      <Whisper placement="top" trigger="hover" speaker={tooltip}>
        <Icon
          icon="cube"
          style={style}
          spin={ami && !ami.status.match(/failed|active/)}
        />
      </Whisper>
    </a>
  );
};

Resources.Instance = function ({ count }) {
  const style = {};
  if (count) {
    style.color = "rgba(255,255,255,0.6)";
  }
  const tooltip = <Tooltip>Instances</Tooltip>;
  return (
    <Whisper placement="top" trigger="hover" speaker={tooltip}>
      <span>
        <Icon icon="server" style={style} />
        {count ? <Badge>{count}</Badge> : null}
      </span>
    </Whisper>
  );
};

const RegionContainer = styled.div`
  position: relative;
`;

function Region(props) {
  const { region } = props;
  const ami = props.amis.find((ami) => ami.region == region);
  const instances = props.instances.filter(
    (instance) => instance.region == region
  );
  if (ami || instances.length) {
    return (
      <RegionContainer>
        <h3>{regions[region]}</h3>
        <Resources>
          <Resources.AMI ami={ami} region={region} />
          <Resources.Instance count={instances.length} />
        </Resources>
      </RegionContainer>
    );
  }
  return null;
}

export default class RegionList extends Component {
  render() {
    const { amis, instances } = this.props;
    if (!amis.length && !instances.length) return null;
    return (
      <Container>
        <h2>Regions</h2>
        {Object.keys(regions).map((key) => (
          <Region key={key} region={key} amis={amis} instances={instances} />
        ))}
      </Container>
    );
  }
}
