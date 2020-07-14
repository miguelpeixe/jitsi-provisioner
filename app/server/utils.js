module.exports.generateId = require("nanoid").customAlphabet(
  "1234567890abcdef",
  6
);
module.exports.exec = function exec(cmd, opts) {
  const exec = require("child_process").exec;
  return new Promise((resolve, reject) => {
    exec(cmd, opts || {}, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout ? stdout : stderr);
      }
    });
  });
};
module.exports.readFile = function readFile(path) {
  const readFile = require("fs").readFile;
  return new Promise((resolve, reject) => {
    readFile(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
module.exports.pathExists = function pathExists(path) {
  const access = require("fs").access;
  return new Promise((resolve, reject) => {
    access(path, (error) => {
      if (!error) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
module.exports.sleep = function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
module.exports.dnsLookup = function dnsLookup(hostname) {
  const lookup = require("dns").lookup;
  return new Promise((resolve, reject) => {
    lookup(hostname, (err, address, family) => {
      if (err) {
        reject(err);
      } else {
        resolve({ address, family });
      }
    });
  });
};
module.exports.randomBytes = function randomBytes(size = 48) {
  const randomBytes = require("crypto").randomBytes;
  return new Promise((resolve, reject) => {
    randomBytes(size, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(buf.toString("hex"));
      }
    });
  });
};
module.exports.downloadFile = function downloadFile(url, destination) {
  const fs = require("fs");
  const file = fs.createWriteStream(destination);
  const get = require("https").get;
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => {
        file.close(() => {
          resolve();
        });
      });
    }).on("error", () => {
      fs.unlink(destination, () => {
        reject();
      });
    });
  });
};
