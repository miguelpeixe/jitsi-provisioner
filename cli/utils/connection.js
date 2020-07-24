const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const Primus = require("primus");
const Emitter = require("primus-emitter");
const ora = require("ora");

const APP_PATH = path.join(__dirname, "../..", "app");
const ENV_PATH = path.join(__dirname, "../..", ".env");
const CONFIG_PATH = path.join(
  process.env.HOME,
  ".config",
  "jitsi-provisioner.json"
);

if (fs.existsSync(APP_PATH) && fs.existsSync(ENV_PATH)) {
  const appPackage = require(path.join(APP_PATH, "package.json"));
  if (appPackage.name == "jitsi-provisioner") {
    require("dotenv").config({
      path: ENV_PATH,
    });
  }
}

const Socket = Primus.createSocket({
  transformer: "websockets",
  plugin: {
    emitter: Emitter,
  },
});

const getToken = () => {
  return jwt.sign({ cli: true }, process.env.JWT_SECRET, {
    audience: `https://${process.env.DOMAIN}`,
    issuer: "jitsi-provisioner",
    expiresIn: "10m",
  });
};

const getConfig = () => {
  if (fs.existsSync(CONFIG_PATH)) {
    const config = fs.readFileSync(CONFIG_PATH);
    return JSON.parse(config);
  }
  return {};
};

const storeConfig = (url, data) => {
  fs.writeFileSync(
    CONFIG_PATH,
    JSON.stringify({
      url,
      accessToken: data.accessToken,
    })
  );
};

module.exports = () => {
  const config = getConfig();

  const spinner = ora().start("Connecting");

  if (!config.accessToken) {
    if (process.env.JWT_SECRET) {
      config.accessToken = getToken();
      config.url = "http://localhost:3030";
    } else {
      spinner.fail("You must authenticate");
      process.exit(1);
      return;
    }
  }

  const socket = new Socket(config.url, { timeout: 2000 });
  socket.on("error", (err) => {
    spinner.fail(err.message || err);
    process.exit(1);
  });
  return new Promise((resolve, reject) => {
    socket.send(
      "create",
      "authentication",
      {
        strategy: "jwt",
        accessToken: config.accessToken,
      },
      (err, data) => {
        if (err) {
          spinner.fail(err.message || err);
          process.exit(1);
        } else {
          spinner.succeed("Connected");
          resolve(socket);
        }
      }
    );
  });
};

module.exports.auth = ({ url, username, password }) => {
  const socket = new Socket(url);
  return new Promise((resolve, reject) => {
    socket.send(
      "create",
      "authentication",
      {
        strategy: "local",
        username,
        password,
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          storeConfig(url, data);
          resolve();
        }
      }
    );
  });
};

module.exports.clear = () => {
  return new Promise((resolve, reject) => {
    fs.unlink(CONFIG_PATH, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
