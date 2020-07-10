const nedbService = require("feathers-nedb");
const NeDB = require("nedb");
const path = require("path");

const hooks = require("./hostnames.hooks");

module.exports = (app) => {
  const Model = new NeDB({
    filename: path.join(app.get("dbPath"), "hostnames.db"),
    autoload: true,
  });

  app.use("/hostnames", nedbService({ Model }));

  const service = app.service("hostnames");

  service.hooks(hooks);
};
