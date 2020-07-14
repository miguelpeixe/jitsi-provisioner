const logger = require("../../logger");
const { deleteRecord } = require("../../cloudflare");
const { sleep } = require("../../utils");

module.exports = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;

    const data = await service.get(context.id);

    const DEMO = data.demo;

    if (!DEMO) {
      try {
        await deleteRecord(data.hostname);
      } catch (e) {
        logger.error(e);
      }
    }

    if (DEMO) {
      await sleep(1 * 1000);
    }

    return context;
  };
};
