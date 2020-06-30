import React from "react";
import ReactDom from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import App from "App.jsx";

import "normalize.css";
import "app.css";

console.log(window.DEMO);

ReactDom.render(
  <Router>
    <App />
  </Router>,
  document.getElementById("app")
);
