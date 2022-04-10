import fs from "fs";
import path, { dirname } from "path";
import jwt from "jsonwebtoken";
import io from "socket.io-client";
import dotenv from "dotenv";

import API from "@jitsi-provisioner/api";
import Storage from "./storage.mjs";

const __dirname = dirname(new URL(import.meta.url).pathname);

const APP_PATH = path.join(__dirname, "../..", "app");
const ENV_PATH = path.join(__dirname, "../..", ".env");
const CONFIG_PATH = path.join(
  process.env.HOME,
  ".config",
  "jitsi-provisioner.json"
);
const storage = new Storage(CONFIG_PATH);

if (fs.existsSync(APP_PATH) && fs.existsSync(ENV_PATH)) {
  const appPackage = JSON.parse(
    fs.readFileSync(path.join(APP_PATH, "package.json"))
  );
  if (appPackage.name == "jitsi-provisioner") {
    dotenv.config({
      path: ENV_PATH,
    });
  }
}

const getLocalToken = () => {
  return jwt.sign({ cli: true }, process.env.JWT_SECRET, {
    audience: `https://${process.env.DOMAIN}`,
    issuer: "jitsi-provisioner",
    expiresIn: "10m",
  });
};

export default async function connect() {
  let url = await storage.getItem("url");
  let auth = await storage.getItem("auth");
  if (!auth) {
    if (process.env.JWT_SECRET) {
      url = "http://localhost:3030";
      auth = getLocalToken();
      await storage.setItem("url", url);
      await storage.setItem("accessToken", auth);
    } else {
      throw new Error("You must authenticate");
    }
  }
  const client = new API({ io, url, authStorage: storage });
  await client.authenticate({
    strategy: "jwt",
    accessToken: auth,
  });
  return client;
}

export async function auth({ url, username, password }) {
  await storage.setItem("url", url);
  const client = new API({ io, url, authStorage: storage });
  return client.authenticate({
    strategy: "local",
    username,
    password,
  });
}

export async function clear() {
  return await storage.purge();
}
