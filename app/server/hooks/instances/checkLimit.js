module.exports = (options = {}) => {
  return async (context) => {
    const max = parseInt(process.env.MAX_INSTANCES);
    if (!max) return context;
    const instances = await context.service.find({});
    if (instances.length >= max)
      throw new Error("Maximum number of instances reached");
    return context;
  };
};
