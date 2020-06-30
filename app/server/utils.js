module.exports.generateId = require("nanoid").customAlphabet(
  "1234567890abcdef",
  5
);
module.exports.exec = function exec(cmd, opts) {
  const exec = require("child_process").exec;
  return new Promise((resolve, reject) => {
    exec(cmd, opts || {}, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
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
