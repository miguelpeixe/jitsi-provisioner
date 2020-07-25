import feathers from "@feathersjs/feathers";
import primus from "@feathersjs/primus-client";
import auth from "@feathersjs/authentication-client";
import axios from "axios";

const socket = new Primus();
const client = feathers();

client.configure(primus(socket));
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
