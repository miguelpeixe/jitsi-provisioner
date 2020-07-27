const nedbService = require("feathers-nedb");
const NeDB = require("nedb");
const path = require("path");

const logger = require("../../logger");

const schema = require("./instances.schema");
const hooks = require("./instances.hooks");

const { detectDownload, download } = require("./instances.middlewares");

module.exports = async (app) => {
  const Model = new NeDB({
    filename: path.join(app.get("dbPath"), "instances.db"),
    autoload: true,
  });

  Model.ensureIndex({ fieldName: "name", unique: true });
  Model.ensureIndex({ fieldName: "hostname", unique: true });

  Model.ensureIndex({ fieldName: "region", unique: false });
  Model.ensureIndex({ fieldName: "type", unique: false });
  Model.ensureIndex({ fieldName: "demo", unique: false });

  app.use("/instances", detectDownload, nedbService({ Model }), download);

  const service = app.service("instances");

  service.schema = schema;

  service.hooks(hooks);

  if (app.get("demo")) {
    const staledInstances = await service.find({
      query: {
        demo: true,
        status: { $nin: ["available", "running", "standby", "terminated"] },
      },
    });
    if (staledInstances.length) {
      logger.info("Handling staled instances");
      for (const instance of staledInstances) {
        await service.patch(instance._id, { action: "terminate" });
      }
    }
  }
};
