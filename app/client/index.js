import React from "react";
import ReactDom from "react-dom";
// import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import App from "App.jsx";

window.DOMAIN = DOMAIN;
window.DEMO = !!DEMO;
window.MAX_INSTANCES = parseInt(MAX_INSTANCES);

import "app.less";

// ReactDom.render(
//   <Router>
//     <Switch>
//       <Route exact path="/" component={App} />
//       <Route render={() => <h1 className="not-found">404 Not found</h1>} />
//     </Switch>
//   </Router>,
//   document.getElementById("app")
// );
ReactDom.render(<App />, document.getElementById("app"));
