const { exec } = require("../../utils");

module.exports = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await exec(`mkdir -p ${data.path}`);

    return context;
  };
};
