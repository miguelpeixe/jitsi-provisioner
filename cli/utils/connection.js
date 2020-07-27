const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const feathers = require("@feathersjs/feathers");
const socketio = require("@feathersjs/socketio-client");
const io = require("socket.io-client");
const auth = require("@feathersjs/authentication-client");

const Storage = require("./storage");

const APP_PATH = path.join(__dirname, "../..", "app");
const ENV_PATH = path.join(__dirname, "../..", ".env");
const CONFIG_PATH = path.join(
  process.env.HOME,
  ".config",
  "jitsi-provisioner.json"
);
const AUTH_STORAGE_KEY = "accessToken";

const storage = new Storage(CONFIG_PATH);

if (fs.existsSync(APP_PATH) && fs.existsSync(ENV_PATH)) {
  const appPackage = require(path.join(APP_PATH, "package.json"));
  if (appPackage.name == "jitsi-provisioner") {
    require("dotenv").config({
      path: ENV_PATH,
    });
  }
}

const getClient = (url) => {
  const socket = io(url);
  const client = feathers();
  client.configure(socketio(socket));
  client.configure(auth({ storage, storageKey: AUTH_STORAGE_KEY }));
  client.on("error", (err) => {
    throw new Error(err);
  });
  return client;
};

const getLocalToken = () => {
  return jwt.sign({ cli: true }, process.env.JWT_SECRET, {
    audience: `https://${process.env.DOMAIN}`,
    issuer: "jitsi-provisioner",
    expiresIn: "10m",
  });
};

module.exports = async () => {
  let url = await storage.getItem("url");
  let auth = await storage.getItem("auth");
  if (!auth) {
    if (process.env.JWT_SECRET) {
      url = "http://localhost:3030";
      auth = getLocalToken();
      await storage.setItem("url", url);
      await storage.setItem(AUTH_STORAGE_KEY, auth);
    } else {
      throw new Error("You must authenticate");
    }
  }
  const client = getClient(url);
  await client.authenticate({
    strategy: "jwt",
    accessToken: auth,
  });
  return client;
};

module.exports.auth = async ({ url, username, password }) => {
  await storage.setItem("url", url);
  const client = getClient(url);
  return client.authenticate({
    strategy: "local",
    username,
    password,
  });
};

module.exports.clear = async () => {
  return await storage.purge();
};
