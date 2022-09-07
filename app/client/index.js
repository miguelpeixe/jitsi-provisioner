import React from "react";
import ReactDom from "react-dom";
import API from "@jitsi-provisioner/api";
import io from "socket.io-client";

import App from "App.jsx";

window.API = new API({ io });

import "app.less";

window.API.getConfig().then((config) => {
  ReactDom.render(<App {...config} />, document.getElementById("app"));
});
