const { sleep } = require("../utils");

module.exports = (time = 1000) => {
  return async (context) => {
    await sleep(time);
    return context;
  };
};
