const path = require("path");
const logger = require("../../logger");
const { set } = require("lodash");
const { downloadFile, sleep, pathExists } = require("../../utils");

module.exports = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    const DEMO = data.demo;

    let patchData = {};
    if (!DEMO) {
      const baseApi = `https://${data.hostname}/${data.apiKey}`;

      try {
        // Download certificates
        const certificatePath = path.join(data.path, "certificate.tar.gz");
        await downloadFile(`${baseApi}/certificates`, certificatePath);
        patchData = {
          "terraform.vars.certificate_path": certificatePath,
        };
      } catch (e) {
        logger.warn(e);
      }
    }

    if (Object.keys(patchData).length) {
      await service.patch(data._id, patchData);
      for (const key in patchData) {
        set(context.result, key, patchData[key]);
      }
    }
    return context;
  };
};
