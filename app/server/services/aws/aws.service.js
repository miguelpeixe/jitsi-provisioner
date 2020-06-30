const nedbService = require("feathers-nedb");
const NeDB = require("nedb");
const path = require("path");
const axios = require("axios");

module.exports = async (app) => {
  const Model = new NeDB({
    filename: path.join(app.get("dbPath"), "aws.db"),
    autoload: true,
  });

  app.use("/aws", nedbService({ Model, multi: true }));

  const service = app.service("aws");

  const disallow = (context) => {
    if (context.params.provider) throw new Error("Not allowed");
    return context;
  };

  service.hooks({
    before: {
      create: [disallow],
      patch: [disallow],
      update: [disallow],
      remove: [disallow],
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
      console.log("AWS instances db:", "ec2instances.info connection error");
    } finally {
      if (aws && aws.data && aws.data.length) {
        // Clear database
        await service.remove(null, {});
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
          await service.create(awsInstance);
        }
        console.log("AWS database updated");
      } else {
        console.log("AWS instances db:", "Unable to update database");
      }
    }
  };

  let shouldUpdate = true;
  if (app.get("demo")) {
    const hasAny = await service.find({ query: { $limit: 1 } });
    if (hasAny.length) shouldUpdate = false;
  }
  if (shouldUpdate) {
    // await updateAws();
  }
};
