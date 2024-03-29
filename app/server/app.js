const feathers = require("@feathersjs/feathers");
const express = require("@feathersjs/express");
const socketio = require("@feathersjs/socketio");
const path = require("path");

const cloudflare = require("./cloudflare");
const terraform = require("./terraform");
const services = require("./services");
const channels = require("./channels");
const client = require("./client");

const logger = require("./logger");
const validateSchema = require("./hooks/validateSchema");

const authentication = require("./authentication");

const app = express(feathers());

// Import parse-domain package
(async () => {
  const package = await import("parse-domain");
  app.parseDomain = package.parseDomain;
})();

app.set("appPath", path.join(__dirname, ".."));
app.set(
  "dataPath",
  process.env.DATA_PATH || path.join(app.get("appPath"), "data")
);
app.set("dbPath", path.join(app.get("dataPath"), "db"));
app.set("domain", process.env.DOMAIN);
app.set("demo", !!parseInt(process.env.DEMO));
app.set("maxInstances", parseInt(process.env.MAX_INSTANCES));
app.set("noClient", !!parseInt(process.env.NO_CLIENT));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.configure(express.rest());
app.configure(socketio());

app.configure(cloudflare);
app.configure(terraform);
app.configure(authentication);
app.configure(services);
app.configure(channels);

app.getConfig = () => {
  const options = ["domain", "demo", "maxInstances", "noClient"];
  const config = options.reduce((acc, key) => {
    acc[key] = app.get(key);
    return acc;
  }, {});
  return config;
};
app.use("/config", (req, res) => {
  res.json(app.getConfig());
});

if (!app.get("noClient")) {
  app.configure(client);
}

app.use(express.errorHandler({ logger }));

app.hooks({
  before: { all: [logger.hook], create: [validateSchema()] },
  after: { all: [logger.hook] },
  error: { all: [logger.hook] },
});

module.exports = app;
