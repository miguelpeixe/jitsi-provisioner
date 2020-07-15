const { upsertRecord } = require("../../cloudflare");
const { sleep } = require("../../utils");
const { fail } = require("./utils");

module.exports = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    const DEMO = data.demo;

    if (!data.publicIp) {
      await fail(service, data._id, "Public IP not found");
    }
    if (!DEMO) {
      await upsertRecord(data.hostname, data.publicIp);
    } else {
      await sleep(1 * 1000);
    }

    return context;
  };
};
