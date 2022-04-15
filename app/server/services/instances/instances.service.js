const nedbService = require("feathers-nedb");
const NeDB = require("nedb");
const path = require("path");
const axios = require("axios");

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

  const monitoring = {};
  const monitorErrorTolerance = 3;
  const containers = app.service("containers");

  service.monitor = async (instanceId) => {
    if (monitoring[instanceId]) {
      return;
    }
    monitoring[instanceId] = true;

    const instance = await service.get(instanceId);
    const { hostname, api } = instance;
    const baseApi = `https://${hostname}/${api.key}`;

    let errorCount = 0;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${baseApi}/stats`);
        await containers.upsert({
          instanceId,
          containerId: res.data.containerId,
          ...res.data,
        });
      } catch (e) {
        errorCount++;
        logger.warn(e);
      }
      if (errorCount >= monitorErrorTolerance) {
        monitoring[instanceId] = false;
        clearInterval(interval);
      }
    }, 5 * 1000);
  };

  service.hooks(hooks);

  // Monitor active instances.
  const activeInstances = await service.find({
    query: {
      demo: false,
      status: "available",
    },
  });
  for (const instance of activeInstances) {
    service.monitor(instance._id);
  }

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
