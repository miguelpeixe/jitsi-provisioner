const io = require("socket.io-client");
const feathers = require("@feathersjs/feathers");
const socketio = require("@feathersjs/socketio-client");
const auth = require("@feathersjs/authentication-client");

const socket = io();
const client = feathers();

client.configure(socketio(socket));
client.configure(auth({ storageKey: "auth" }));

window.API = client;

export default client;
