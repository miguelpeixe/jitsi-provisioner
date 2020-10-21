import axios from "axios";
import adapter from "axios/lib/adapters/xhr";
import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import auth from "@feathersjs/authentication-client";

import Service from "./service";

import AWS from "./services/aws";
import Users from "./services/users";
import Instances from "./services/instances";

export default class API {
  constructor(options = {}) {
    this._client = options.app;

    // Featherjs client config if no app is provided
    if (!this._client) {
      this.url = options.url || "/";
      this.authStorage = options.authStorage;

      if (!options.io) {
        throw new Error("Socket.IO client is required");
      }

      this._socket = options.io(this.url);
      this._client = feathers();
      this._client.configure(socketio(this._socket));

      let authConfig = { storageKey: "accessToken" };
      if (this.authStorage) {
        authConfig.storage = this.authStorage;
      }
      this._client.configure(auth(authConfig));
    }

    // Setup rest client
    const rest = axios.create({
      baseURL: this.url,
      adapter,
    });
    this._client.on("login", (auth) => {
      rest.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${auth.accessToken}`;
    });
    this._client.on("logout", () => {
      rest.defaults.headers.common["Authorization"] = null;
    });
    this._rest = rest;

    // Setup services
    this.aws = new AWS(this);
    this.users = new Users(this);
    this.instances = new Instances(this);
    this.history = new Service("history", this);
  }
  get(key) {
    return this._client.get(key);
  }
  set(key, val) {
    return this._client.set(key, val);
  }
  on(event, listener) {
    return this._client.on(event, listener);
  }
  off(event, listener) {
    return this._client.off(event, listener);
  }
  service(serviceName) {
    return new Service(serviceName, this._client);
  }
  authenticate(options = {}) {
    return this._client.authenticate(options);
  }
  reAuthenticate() {
    return this._client.reAuthenticate();
  }
  logout() {
    return this._client.logout();
  }
}
