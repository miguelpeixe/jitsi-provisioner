const io = require("socket.io-client");
const feathers = require("@feathersjs/feathers");
const socketio = require("@feathersjs/socketio-client");

const socket = io();
const client = feathers();

client.configure(socketio(socket));

export default client;
