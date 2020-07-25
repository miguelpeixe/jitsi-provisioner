const nedbService = require("feathers-nedb");
const NeDB = require("nedb");
const path = require("path");
const axios = require("axios");
const logger = require("../../logger");
const { authenticate } = require("@feathersjs/authentication").hooks;
const { disallow } = require("feathers-hooks-common");
const awsUtils = require("@jitsi-provisioner/aws-utils");

module.exports = async (app) => {
  const Model = new NeDB({
    filename: path.join(app.get("dbPath"), "aws.db"),
    autoload: true,
  });

  app.use("/aws", nedbService({ Model, multi: true }));

  const service = app.service("aws");

  service.hooks({
    before: {
      all: [authenticate("jwt")],
      create: [disallow("external")],
      patch: [disallow("external")],
      update: [disallow("external")],
      remove: [disallow("external")],
    },
  });

  const updateAws = async () => {
    try {
      let promises = [];
      const instances = await awsUtils.instances();
      if (instances.length) {
        await service.remove(null, {});
        for (instance of instances) {
          promises.push(service.create(instance));
        }
        await Promise.all(promises);
        logger.info("AWS database updated");
      }
    } catch (err) {
      logger.warn(err.message);
    }
  };

  let shouldUpdate = true;
  if (app.get("demo")) {
    const hasAny = await service.find({ query: { $limit: 1 } });
    if (hasAny.length) shouldUpdate = false;
  }
  if (shouldUpdate) {
    await updateAws();
  }
};
