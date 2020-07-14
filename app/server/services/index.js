const users = require("./users/users.service.js");
const history = require("./history/history.service.js");
const aws = require("./aws/aws.service.js");
const amis = require("./amis/amis.service.js");
const instances = require("./instances/instances.service.js");

module.exports = function (app) {
  app.configure(users);
  app.configure(history);
  app.configure(aws);
  app.configure(amis);
  app.configure(instances);
};
