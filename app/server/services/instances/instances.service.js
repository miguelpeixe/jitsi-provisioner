const nedbService = require("feathers-nedb");
const NeDB = require("nedb");
const path = require("path");

const hooks = require("./instances.hooks");

module.exports = (app) => {
  const Model = new NeDB({
    filename: path.join(app.get("dbPath"), "instances.db"),
    autoload: true,
  });

  app.use("/instances", nedbService({ Model }));

  const service = app.service("instances");

  service.hooks(hooks);
};
