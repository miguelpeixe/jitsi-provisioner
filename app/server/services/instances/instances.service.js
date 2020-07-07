const nedbService = require("feathers-nedb");
const NeDB = require("nedb");
const path = require("path");

const hooks = require("./instances.hooks");
const { detectDownload, download } = require("./instances.middlewares");

module.exports = (app) => {
  const Model = new NeDB({
    filename: path.join(app.get("dbPath"), "instances.db"),
    autoload: true,
  });

  app.use("/instances", detectDownload, nedbService({ Model }), download);

  const service = app.service("instances");

  service.hooks(hooks);
};
