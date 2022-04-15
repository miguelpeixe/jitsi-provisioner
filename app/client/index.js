import React from "react";
import ReactDom from "react-dom";
import API from "@jitsi-provisioner/api";
import io from "socket.io-client";

import App from "App.jsx";

window.API = new API({ io });

window.DOMAIN = DOMAIN;
window.DEMO = !!DEMO;
window.MAX_INSTANCES = parseInt(MAX_INSTANCES);

import "app.less";

ReactDom.render(<App />, document.getElementById("app"));
