const instances = require("./instances/instances.service.js");

module.exports = function (app) {
  app.configure(instances);
};
