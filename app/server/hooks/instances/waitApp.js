const axios = require("axios");
const { sleep } = require("../../utils");
const { fail } = require("./utils");

module.exports = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    const DEMO = data.demo;

    let online;
    if (!DEMO) {
      const startTime = Date.now();
      const timeout = 5 * 60 * 1000; // 5 minutes before giving up

      let error;
      let attemptTime = Date.now();
      while (!online && startTime + timeout >= attemptTime) {
        try {
          const res = await axios.get(`https://${data.hostname}`);
          online = res.status;
        } catch (e) {
          online = false;
          error = e.code;
        } finally {
          if (!online) {
            await sleep(2 * 1000); // Wait 2 seconds before another fetch
            attemptTime = Date.now();
          }
        }
      }
    } else {
      await sleep(2 * 1000);
      online = 200;
    }

    if (!online) {
      await fail(service, data._id, "Something went wrong");
    }

    return context;
  };
};
