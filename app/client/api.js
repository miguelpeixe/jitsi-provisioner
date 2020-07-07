const io = require("socket.io-client");
const feathers = require("@feathersjs/feathers");
const socketio = require("@feathersjs/socketio-client");
const auth = require("@feathersjs/authentication-client");
const axios = require("axios");

const socket = io();
const client = feathers();

client.configure(socketio(socket));
client.configure(auth({ storageKey: "auth" }));

client.rest = axios.create({
  baseURL: "/",
});

client.on("login", (auth) => {
  client.rest.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${auth.accessToken}`;
});

client.on("logout", () => {
  console.log("logged out");
  client.rest.defaults.headers.common["Authorization"] = null;
});

window.API = client;

export default client;
