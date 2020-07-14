const { sleep } = require("../../utils");
const { fail } = require("./utils");
const { getZone } = require("../../cloudflare");

module.exports = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    const DEMO = data.demo;

    if (!DEMO) {
      const zone = await getZone(data.hostname);
      if (!zone) {
        await fail(
          service,
          data._id,
          "Could not connect to zone in CloudFlare"
        );
      }
    } else {
      await sleep(1 * 1000);
    }

    return context;
  };
};
