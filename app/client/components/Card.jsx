import React, { Component } from "react";
import styled, { css } from "styled-components";

const cardStyles = css`
  @keyframes loading {
    0% {
      opacity: 0.75;
    }
    100% {
      opacity: 1;
    }
  }
  background: #fff;
  color: #333;
  border-radius: 4px;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.2);
  margin: 0 2rem 2rem;
  ${(props) =>
    props.info &&
    css`
      font-size: 0.8em;
      background: transparent;
      color: #fff;
      border: 2px solid rgba(0, 0, 0, 0.2);
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
    `}
  ${(props) =>
    props.new &&
    css`
      background-image: linear-gradient(
        -90deg,
        #f0f0f0 0,
        #ffffff 50%,
        #f0f0f0 100%
      );
    `}
  ${(props) =>
    props.loading &&
    css`
      background-image: none;
      animation-name: loading;
      animation-duration: 0.75s;
      animation-timing-function: linear;
      animation-direction: alternate;
      animation-iteration-count: infinite;
    `}
  h3 {
    margin: 0 0 1rem;
    font-family: monospace;
    text-transform: uppercase;
    font-weight: 600;
  }
  a {
    color: #61b9ff;
    text-decoration: none;
    &:hover,
    &:active {
      color: #4aafff;
    }
  }
  footer {
    a,
    a:active,
    a:hover {
      color: #fff;
    }
  }
  @media (max-width: 860px) {
    margin: 0 0 1rem;
  }
`;

const Card = styled.div`
  ${cardStyles}
`;

const ListItem = styled.li`
  ${cardStyles}
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Content = styled.section`
  padding: 1rem 2rem;
  position: relative;
  select {
    background: transparent;
    border: 0;
  }
  table {
    font-size: 0.9em;
    width: 100%;
    border-spacing: 0;
    th,
    td {
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      padding: 0.5rem 0;
    }
    th {
      font-weight: 600;
      color: rgba(0, 0, 0, 0.4);
      text-align: left;
    }
    td {
      text-align: right;
    }
    tr:last-child {
      th,
      td {
        border-bottom: 0;
      }
    }
  }
  h2,
  h3,
  h4 {
    margin: 0;
    font-weight: 600;
  }
  *:last-child {
    margin-bottom: 0;
  }
  @media (max-width: 700px) {
    padding: 1rem;
  }
  @media (max-width: 370px) {
    font-size: 0.8em;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 1.5rem 2rem;
  margin: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  h3 {
    flex: 1 1 100%;
    margin: 0;
    color: #252a34;
  }
  p,
  div {
    font-size: 0.8em;
    margin: 0 0 0 1rem;
    flex: 0 0 auto;
    color: rgba(0, 0, 0, 0.5);
  }
  @media (max-width: 700px) {
    padding: 1rem;
  }
`;

const Footer = styled.footer`
  display: flex;
  margin: 0;
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 0 0 4px 4px;
  a,
  input {
    text-align: center;
    flex: 1 1 100%;
    margin: 0 0.5rem;
  }
  @media (max-width: 700px) {
    padding: 1rem 0.5rem;
  }
`;

Card.Header = Header;
Card.Content = Content;
Card.List = List;
Card.ListItem = ListItem;
Card.Footer = Footer;

export default Card;
