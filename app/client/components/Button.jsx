import React, { Component } from "react";
import styled, { css } from "styled-components";

const buttonStyles = css`
  border-radius: 4px;
  color: #fff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  font-weight: 600;
  border: 0;
  cursor: pointer;
  outline: none;
  line-height: inherit;
  background-color: #252a34;
  border: 1px solid #333a48;
  position: relative;
  &:hover {
    color: #fff;
    background-color: #333a48;
    text-decoration: none;
  }
  &:active {
    color: #fff;
    background-color: #3b4354;
    text-decoration: none;
  }
  &:focus {
    color: #fff;
    background-color: #3b4354;
    text-decoration: none;
  }
  ${(props) =>
    props.block &&
    css`
      width: 100%;
      display: block;
      text-align: center;
    `}
  ${(props) =>
    props.small &&
    css`
      font-size: 0.9em;
    `}
  ${(props) =>
    props.light &&
    css`
      background-color: transparent;
      color: #333;
    `}
  ${(props) =>
    props.remove &&
    css`
      background-color: #b70000;
      border-color: #9c0000;
      &:hover {
        background: #d60000;
      }
      &:active,
      &:focus {
        background: #da0000;
      }
    `}
  ${(props) =>
    props.jitsi &&
    css`
      background-color: #0c5ecb;
      background-image: linear-gradient(
        -90deg,
        #0c5ecb 0,
        #0074ff 50%,
        #0c5ecb 100%
      );
      border-color: #0c5ecb;
      &:hover {
        background-color: #0074ff;
        background-image: none;
      }
      &:active {
        background-color: #0c5ecb;
        background-image: none;
      }
    `}
  ${(props) =>
    props.disabled &&
    css`
      background-color: rgba(0, 0, 0, 0.1) !important;
      background-image: none !important;
      border-color: rgba(0, 0, 0, 0.1);
      cursor: not-allowed;
    `}
`;

const WrapperA = styled.a`
  ${buttonStyles}
`;

const WrapperButton = styled.button`
  ${buttonStyles}
`;

const Group = styled.nav`
  display: flex;
  margin: 0 -0.5rem;
  > * {
    margin: 0 0.5rem;
    flex: 1 1 100%;
    text-align: center;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -0.2rem;
  left: 100%;
  margin-left: -0.8rem;
  font-size: 0.7em;
  border-radius: 4px;
  line-height: 1;
  background: #333a48;
  padding: 0.3rem;
  display: inline-block;
  letter-spacing: 0.08rem;
  font-weight: normal;
`;

export default class Button extends Component {
  static Group = Group;
  static Badge = Badge;
  render() {
    const { href, ...props } = this.props;
    if (href) {
      return <WrapperA href={href} {...props} />;
    } else {
      return <WrapperButton {...props} />;
    }
  }
}
