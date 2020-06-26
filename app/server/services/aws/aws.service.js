const nedbService = require("feathers-nedb");
const NeDB = require("nedb");
const path = require("path");
const axios = require("axios");

module.exports = async (app) => {
  const Model = new NeDB({
    filename: path.join(app.get("dbPath"), "aws.db"),
    autoload: true,
  });

  app.use("/aws", nedbService({ Model }));

  const service = app.service("aws");

  const aws = await axios.get(
    "https://raw.githubusercontent.com/powdahound/ec2instances.info/master/www/instances.json"
  );

  for (const item of aws.data) {
    let hasLocal = false;
    try {
      await service.get(item.instance_type);
      hasLocal = true;
    } catch (e) {
    } finally {
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
      if (hasLocal) {
        await service.update(awsInstance._id, awsInstance);
      } else {
        await service.create(awsInstance);
      }
    }
  }
};
