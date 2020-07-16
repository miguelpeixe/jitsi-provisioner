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

    if (!DEMO) {
      const baseApi = `https://${data.hostname}/${data.apiKey}`;

      try {
        // Download Jitsi data
        const jitsiPath = path.join(data.path, "jitsi.tar.gz");
        await downloadFile(`${baseApi}/jitsi`, jitsiPath);
      } catch (e) {
        logger.warn(e);
      }

      try {
        // Download recordings
        const recordingsPath = path.join(data.path, "recordings.tar.gz");
        await downloadFile(`${baseApi}/recordings`, recordingsPath);
      } catch (e) {
        logger.warn(e);
      }

      try {
        // Download transcripts
        const transcriptsPath = path.join(data.path, "transcripts.tar.gz");
        await downloadFile(`${baseApi}/transcripts`, transcriptsPath);
      } catch (e) {
        logger.warn(e);
      }
    }
    return context;
  };
};
