const axios = require("axios");

module.exports = {
  regions: {
    "af-south-1": "Africa (Cape Town)",
    "ap-east-1": "Asia-Pacific (Hong Kong)",
    "ap-south-1": "Asia-Pacific (Mumbai)",
    "ap-northeast-3": "Asia Pacific (Osaka-Local)",
    "ap-northeast-2": "Asia-Pacific (Seoul)",
    "ap-southeast-1": "Asia-Pacific (Singapore)",
    "ap-southeast-2": "Asia-Pacific (Sydney)",
    "ap-northeast-1": "Asia-Pacific (Tokyo)",
    "ca-central-1": "Canada (Central)",
    "eu-central-1": "Europe (Frankfurt)",
    "eu-west-1": "Europe (Ireland)",
    "eu-west-2": "Europe (London)",
    "eu-west-3": "Europe (Paris)",
    "eu-north-1": "Europe (Stockholm)",
    "eu-south-1": "Europe (Milan)",
    "me-south-1": "Middle East (Bahrain)",
    "sa-east-1": "South America (São Paulo)",
    "us-east-1": "US East (N. Virginia)",
    "us-east-2": "US East (Ohio)",
    "us-west-1": "US West (Northern California)",
    "us-west-2": "US West (Oregon)",
    "us-gov-west-1": "AWS GovCloud (US-West)",
    "us-gov-east-1": "AWS GovCloud (US-East)",
  },
  instances: async function () {
    let res;
    let instances = [];
    try {
      res = await axios.get(
        "https://raw.githubusercontent.com/powdahound/ec2instances.info/master/www/instances.json"
      );
    } catch (e) {
      console.warn("ec2instances.info connection error");
    } finally {
      if (res && res.data && res.data.length) {
        for (const item of res.data) {
          const instance = {
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
              instance.pricing[region] = item.pricing[region].linux.ondemand;
            }
          }
          instances.push(instance);
        }
      }
    }
    return instances;
  },
};
