const nedbService = require("feathers-nedb");
const NeDB = require("nedb");
const path = require("path");
const axios = require("axios");
const logger = require("../../logger");
const { authenticate } = require("@feathersjs/authentication").hooks;
const { disallow } = require("feathers-hooks-common");

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
    let aws;
    try {
      // Fetch from ec2instances.info
      aws = await axios.get(
        "https://raw.githubusercontent.com/powdahound/ec2instances.info/master/www/instances.json"
      );
    } catch (e) {
      logger.warn("ec2instances.info connection error");
    } finally {
      if (aws && aws.data && aws.data.length) {
        // Clear database
        await service.remove(null, {});
        const promises = [];
        for (const item of aws.data) {
          const awsInstance = {
            _id: item.instance_type,
            processor: item.physical_processor,
            vcpu: item.vCPU,
            memory: item.memory,
            clockSpeed: item.clock_speed_ghz,
            network: item.network_performance,
            prettyName: item.pretty_name,
            gpu: {
              size: item.GPU,
              memory: item.GPU_memory,
              model: item.GPU_model,
            },
            pricing: {},
          };
          for (region in item.pricing) {
            if (
              item.pricing[region] &&
              item.pricing[region].linux &&
              item.pricing[region].linux.ondemand
            ) {
              awsInstance.pricing[region] = item.pricing[region].linux.ondemand;
            }
          }
          promises.push(service.create(awsInstance));
        }
        await Promise.all(promises);
        logger.info("AWS database updated");
      } else {
        logger.warn("Unable to update AWS instance types database");
      }
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
