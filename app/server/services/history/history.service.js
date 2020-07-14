const nedbService = require("feathers-nedb");
const NeDB = require("nedb");
const path = require("path");
const { authenticate } = require("@feathersjs/authentication").hooks;
const { disallow } = require("feathers-hooks-common");

module.exports = async (app) => {
  const Model = new NeDB({
    filename: path.join(app.get("dbPath"), "history.db"),
    autoload: true,
  });

  app.use("/history", nedbService({ Model }));

  const service = app.service("history");

  service.hooks({
    before: {
      all: [authenticate("jwt")],
      create: [disallow("external")],
      patch: [disallow("external")],
      update: [disallow("external")],
      remove: [disallow("external")],
    },
  });
};
