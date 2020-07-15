const path = require("path");
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
      const certificatePath = path.join(data.path, "certificate.tar.gz");
      const hasCertificate = await pathExists(certificatePath);

      const url = `https://${data.hostname}/${data.apiKey}/certificates`;
      await downloadFile(url, certificatePath);
      patchData = {
        "terraform.vars.certificate_path": certificatePath,
      };
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
