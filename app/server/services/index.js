const instances = require("./instances/instances.service.js");
const aws = require("./aws/aws.service.js");

module.exports = function (app) {
  app.configure(instances);
  app.configure(aws);
};
