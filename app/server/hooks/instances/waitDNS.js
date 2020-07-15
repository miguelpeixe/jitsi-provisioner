const { sleep, dnsLookup } = require("../../utils");
const { fail } = require("./utils");

module.exports = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    const DEMO = data.demo;

    if (!DEMO) {
      if (!data.publicIp) {
        await fail(service, data._id, "Public IP not found");
      }

      const startTime = Date.now();
      const timeout = 5 * 60 * 1000; // 5 minutes before giving up

      let error;
      let address;
      let attemptTime = Date.now();
      while (address != data.publicIp && startTime + timeout >= attemptTime) {
        try {
          const res = await dnsLookup(data.hostname);
          address = res.address;
        } catch (e) {
          address = false;
          error = e.code;
        } finally {
          await sleep(5 * 1000); // Wait 5 seconds before another lookup
          attemptTime = Date.now();
        }
      }

      if (address != data.publicIp) {
        await fail(service, data._id, "Could not resolve hostname");
      }
    } else {
      await sleep(1 * 1000);
    }
  };
};
