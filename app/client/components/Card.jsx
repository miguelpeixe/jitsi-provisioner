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
  margin: 0 0 2rem;
  ${(props) =>
    props.info &&
    css`
      font-size: 0.9em;
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
  @media (max-width: 860px) {
    margin: 0 0 1rem;
  }
  @media (max-width: 500px) {
    margin: 0;
    border-radius: 0;
    box-shadow: 0 0 0;
    border: 0;
    border-bottom: 1px solid rgba(0,0,0,0.2);
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
  margin: 1rem 2rem;
  position: relative;
  h2,
  h3,
  h4 {
    margin: 0;
    font-weight: 600;
    line-height: inherit;
  }
  h4 {
    font-size: 1em;
  }
  table {
    width: 100%;
    border-spacing: 0;
    margin: 0 0 1rem;
    th,
    td {
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      padding: 0.5rem 0;
      white-space: nowrap;
      text-align: left;
    }
    th {
      font-weight: 600;
      color: rgba(0, 0, 0, 0.4);
      padding-right: 3rem;
      i {
        margin-right: 0.5rem;
      }
    }
    td {
      width: 100%;
    }
    tr:last-child {
      th,
      td {
        border-bottom: 0;
      }
    }
  }
  > *:last-child {
    margin-bottom: 0;
  }
  @media (max-width: 760px) {
    margin: 1rem;
  }
  @media (max-width: 370px) {
    font-size: 0.9em;
    table th {
      padding-right: 1.5rem;
    }
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 1.5rem 2rem;
  margin: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  background: rgba(0, 0, 0, 0.05);
  i {
    flex: 0 0 auto;
    margin-right: 1.5rem;
    color: rgba(0, 0, 0, 0.5);
  }
  h4,
  h3 {
    font-size: 1em;
    flex: 1 1 100%;
    margin: 0;
    color: #252a34;
    line-height: inherit;
  }
  h3 {
    font-family: monospace;
    text-transform: uppercase;
    font-weight: 600;
  }
  p,
  div {
    font-size: 0.8em;
    margin: 0 0 0 0.75rem;
    flex: 0 0 auto;
    color: rgba(0, 0, 0, 0.5);
  }
  @media (max-width: 760px) {
    padding: 1rem;
    i {
      margin-right: 1rem;
    }
  }
`;

const Footer = styled.footer`
  margin: 0;
  padding: 0 2rem 1.5rem;
  border-radius: 0 0 4px 4px;
  @media (max-width: 760px) {
    padding: 0 1rem 1rem;
  }
`;

Card.Header = Header;
Card.Content = Content;
Card.List = List;
Card.ListItem = ListItem;
Card.Footer = Footer;

export default Card;
