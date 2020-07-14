const { exec } = require("../../utils");

module.exports = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await exec(`ssh-keygen -t rsa -b 2048 -N "" -m PEM -f ${data.key.path} && \
      chmod 400 ${data.key.path}`);

    return context;
  };
};
