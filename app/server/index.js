const feathers = require("@feathersjs/feathers");
const express = require("@feathersjs/express");
const socketio = require("@feathersjs/socketio");
const path = require("path");

const cloudflare = require("./cloudflare");
const terraform = require("./terraform");

const services = require("./services");

const app = express(feathers());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.configure(express.rest());
app.configure(socketio());

app.set("appPath", path.join(__dirname, ".."));
app.set(
  "dataPath",
  process.env.DATA_DIR || path.join(app.get("appPath"), "data")
);
app.set("dbPath", path.join(app.get("dataPath"), "db"));
app.set("domain", process.env.DOMAIN);

app.configure(cloudflare);
app.configure(terraform);

app.configure(services);

app.use(express.errorHandler());

app
  .listen(3030)
  .on("listening", () =>
    console.log("Feathers server listening on localhost:3030")
  );
