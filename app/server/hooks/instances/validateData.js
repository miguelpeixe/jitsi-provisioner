const parseDomain = require("parse-domain").parseDomain;

module.exports = (options = {}) => {
  return async (context) => {
    const { data } = context;

    // Validate hostname
    const domain = parseDomain(data.hostname);
    if (domain.type == "INVALID" || (domain.errors && domain.errors.length)) {
      throw new Error("Invalid hostname");
    }

    // Ensure unique ID
    const idInstances = await context.service.find({
      query: { _id: data._id },
    });
    if (idInstances.length) {
      throw new Error("Duplicate ID");
    }

    // Ensure unique hostname
    const hostnameInstances = await context.service.find({
      query: { hostname: data.hostname },
    });
    if (hostnameInstances.length) {
      throw new Error("Hostname already in use");
    }

    // AWS instance availability
    const awsInstance = await context.app.service("aws").get(data.type);
    if (!awsInstance) {
      throw new Error("AWS instance not found");
    }
    if (!awsInstance.pricing[data.region]) {
      throw new Error("AWS instance not available in the selected region");
    }

    return context;
  };
};
