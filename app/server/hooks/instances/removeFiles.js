const logger = require("../../logger");
const { exec } = require("../../utils");

module.exports = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;

    const data = await service.get(context.id);

    try {
      await exec(`rm -r ${data.path}`);
    } catch (e) {
      logger.error(e);
    }
    return context;
  };
};
