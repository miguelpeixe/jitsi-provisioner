const nedbService = require("feathers-nedb");
const NeDB = require("nedb");
const path = require("path");

const schema = require("./amis.schema");
const hooks = require("./amis.hooks");

module.exports = (app) => {
  const Model = new NeDB({
    filename: path.join(app.get("dbPath"), "amis.db"),
    autoload: true,
  });

  app.use("/amis", nedbService({ Model }));

  const service = app.service("amis");

  service.schema = schema;

  service.hooks(hooks);
};
