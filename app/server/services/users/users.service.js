const nedbService = require("feathers-nedb");
const NeDB = require("nedb");
const path = require("path");

const hooks = require("./users.hooks");

module.exports = (app) => {
  const Model = new NeDB({
    filename: path.join(app.get("dbPath"), "users.db"),
    autoload: true,
  });

  app.use("/users", nedbService({ Model }));

  const service = app.service("users");

  service.hooks(hooks);
};
