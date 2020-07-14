const parseDomain = require("parse-domain").parseDomain;

module.exports = (status = "") => {
  return async (context) => {
    if (!status) {
      return context;
    }
    await context.service.patch(context.id || context.result._id, { status });
    return context;
  };
};
