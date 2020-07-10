import io from "socket.io-client";
import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import auth from "@feathersjs/authentication-client";
import axios from "axios";

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
  client.rest.defaults.headers.common["Authorization"] = null;
});

export default client;
