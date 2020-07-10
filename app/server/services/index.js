const users = require("./users/users.service.js");
const aws = require("./aws/aws.service.js");
const hostnames = require("./hostnames/hostnames.service.js");
const amis = require("./amis/amis.service.js");
const instances = require("./instances/instances.service.js");

module.exports = function (app) {
  app.configure(users);
  app.configure(aws);
  app.configure(hostnames);
  app.configure(amis);
  app.configure(instances);
};
