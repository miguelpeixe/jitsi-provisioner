const { set } = require("lodash");
const logger = require("../../logger");

module.exports = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    const DEMO = data.demo;

    const amis = await app
      .service("amis")
      .find({ query: { region: data.region, status: "active" } });

    let amiId;

    if (amis.length) {
      const ami = amis[0];
      amiId = false;
      if (!DEMO) {
        try {
          amiId = ami.terraform.state.resources[0].instances[0].attributes.id;
        } catch (e) {
          logger.warn(`Could not find AMI state`, {
            instance: data._id,
            ami: ami._id,
          });
        }
      } else {
        amiId = "ami-123456789";
      }
      if (amiId) {
        const patchData = {
          ami: ami._id,
          "terraform.vars.ami_id": amiId,
        };
        await service.patch(data._id, patchData);
        for (const key in patchData) {
          set(context.result, key, patchData[key]);
        }
      }
    }
    return context;
  };
};
