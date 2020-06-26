const feathers = require("@feathersjs/feathers");
const express = require("@feathersjs/express");
const socketio = require("@feathersjs/socketio");
const path = require("path");

const cloudflare = require("./cloudflare");
const terraform = require("./terraform");
const services = require("./services");
const channels = require("./channels");

const app = express(feathers());

const env = app.get("env");
const webpackConfig = require("../webpack.config");

app.set("appPath", path.join(__dirname, ".."));
app.set(
  "dataPath",
  process.env.DATA_DIR || path.join(app.get("appPath"), "data")
);
app.set("dbPath", path.join(app.get("dataPath"), "db"));
app.set("domain", process.env.DOMAIN);

app.set("demo", false);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.configure(express.rest());
app.configure(socketio());

app.configure(cloudflare);
app.configure(terraform);
app.configure(services);
app.configure(channels);

app.use(express.errorHandler());

if (env !== "production") {
  const webpack = require("webpack");
  const webpackDev = require("webpack-dev-middleware");
  const webpackHot = require("webpack-hot-middleware");
  const compiler = webpack(webpackConfig);
  const history = require("connect-history-api-fallback");
  app.use(history());
  app.use(
    webpackDev(compiler, {
      logLevel: "warn",
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

app
  .listen(3030)
  .on("listening", () =>
    console.log("Feathers server listening on localhost:3030")
  );
