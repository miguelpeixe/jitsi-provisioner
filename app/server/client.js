const express = require("@feathersjs/express");
const path = require("path");
const logger = require("./logger");

module.exports = (app) => {
  const env = app.get("env");
  const webpackConfig = require("../webpack.config")({
    production: env == "production",
  });

  if (env != "production") {
    logger.info("Building client");
    const webpack = require("webpack");
    const webpackDev = require("webpack-dev-middleware");
    const webpackHot = require("webpack-hot-middleware");
    const compiler = webpack(webpackConfig);
    const history = require("connect-history-api-fallback");
    app.use(history());
    app.use(
      webpackDev(compiler, {
        publicPath: webpackConfig.output.publicPath,
      })
    );
    app.use(
      webpackHot(compiler, {
        log: console.log,
        path: "/__webpack_hmr",
        heartbeat: 10 * 1000,
      })
    );
  } else {
    app.use(express.static(webpackConfig.output.path));
    app.get("/*", (req, res) => {
      res.sendFile(path.join(webpackConfig.output.path, "index.html"));
    });
  }
};
