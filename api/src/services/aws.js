import axios from "axios";
import Service from "../service";

export default class AWS extends Service {
  constructor(client) {
    super("aws", client);
  }
  async init() {
    if (!this._initialized) {
      this.instances = await this.find();
      this._initialized = true;
    }
    return this;
  }
  async getInstances() {
    if (!this._initialized) {
      await this.init();
    }
    return this.instances;
  }
  async getServer(type) {
    if (!this._initialized) {
      await this.init();
    }
    if (!this.instances.length || !type) return;
    return this.instances.find((item) => item._id == type);
  }
  regions(key = false) {
    const regions = {
      "af-south-1": "Africa (Cape Town)",
      "ap-east-1": "Asia Pacific (Hong Kong)",
      "ap-south-1": "Asia Pacific (Mumbai)",
      "ap-northeast-3": "Asia Pacific (Osaka-Local)",
      "ap-northeast-2": "Asia Pacific (Seoul)",
      "ap-southeast-1": "Asia Pacific (Singapore)",
      "ap-southeast-2": "Asia Pacific (Sydney)",
      "ap-northeast-1": "Asia Pacific (Tokyo)",
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
    };
    if (key) {
      return regions[key];
    }
    return regions;
  }
  async fetchInstances() {
    const instanceMap = {};
    const regionMap = this.regions();
    for (const region in regionMap) {
      const regionName = regionMap[region];
      const url = `https://b0.p.awsstatic.com/pricing/2.0/meteredUnitMaps/ec2/USD/current/ec2-ondemand-without-sec-sel/${encodeURIComponent(
        regionName
      )}/Linux/index.json?timestamp=${new Date().getTime()}`;
      try {
        const res = await axios.get(url);
        const regionInstances = res.data.regions[regionName];
        for (const instanceKey in regionInstances) {
          const instance = regionInstances[instanceKey];
          if (!instanceMap[instance["Instance Type"]]) {
            instanceMap[instance["Instance Type"]] = {
              _id: instance["Instance Type"],
              code: instance["rateCode"],
              vcpu: instance["vCPU"],
              memory: instance["Memory"],
              network: instance["Network Performance"],
              storage: instance["Storage"],
              pricing: {},
            };
          }
          instanceMap[instance["Instance Type"]].pricing[region] = parseFloat(
            instance["price"]
          );
        }
      } catch (err) {
        continue;
      }
    }
    return Object.values(instanceMap);
  }
}
