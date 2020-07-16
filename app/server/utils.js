const generateId = require("nanoid").customAlphabet("1234567890abcdef", 6);
const exec = function exec(cmd, opts) {
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
const readFile = function readFile(path) {
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
const pathExists = function pathExists(path) {
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
const sleep = function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
const dnsLookup = function dnsLookup(hostname) {
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
const randomBytes = function randomBytes(size = 48) {
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
const downloadFile = function downloadFile(url, destination) {
  const fs = require("fs");
  const tmpPath = `${destination}.downloading`;
  const file = fs.createWriteStream(tmpPath);
  const get = require("https").get;
  const handleError = (cb) => {
    fs.unlink(tmpPath, () => {
      cb && cb();
    });
  };
  return new Promise((resolve, reject) => {
    const req = get(url, { timeout: 3000 }, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        handleError(() => {
          reject(`Server returned ${res.statusCode}`);
        });
      } else {
        res.pipe(file);
        file.on("finish", () => {
          file.close(() => {
            fs.rename(tmpPath, destination, (err) => {
              if (err) {
                handleError(() => {
                  reject(err);
                });
              } else {
                resolve();
              }
            });
          });
        });
      }
    });
    req.on("timeout", () => {
      req.abort();
    });
    req.on("error", (err) => {
      handleError(() => {
        reject(err);
      });
    });
  });
};

module.exports.generateId = generateId;
module.exports.exec = exec;
module.exports.readFile = readFile;
module.exports.pathExists = pathExists;
module.exports.sleep = sleep;
module.exports.dnsLookup = dnsLookup;
module.exports.randomBytes = randomBytes;
module.exports.downloadFile = downloadFile;
