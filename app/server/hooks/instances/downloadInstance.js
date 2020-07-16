const path = require("path");
const jwt = require("jsonwebtoken");
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
      const baseApi = `https://${data.hostname}/${data.api.key}`;

      const token = jwt.sign({}, data.api.secret, {
        expiresIn: "1m",
      });
      const reqOptions = {
        headers: { Authorization: `Bearer ${token}` },
      };

      try {
        // Download Jitsi data
        await downloadFile(
          `${baseApi}/jitsi`,
          path.join(data.path, "jitsi.tar.gz"),
          reqOptions
        );
      } catch (e) {
        logger.warn(e);
      }

      try {
        // Download recordings
        await downloadFile(
          `${baseApi}/recordings`,
          path.join(data.path, "recordings.tar.gz"),
          reqOptions
        );
      } catch (e) {
        logger.warn(e);
      }

      try {
        // Download transcripts
        await downloadFile(
          `${baseApi}/transcripts`,
          path.join(data.path, "transcripts.tar.gz"),
          reqOptions
        );
      } catch (e) {
        logger.warn(e);
      }
    }
    return context;
  };
};
