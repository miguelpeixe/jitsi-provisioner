module.exports = (options = {}) => {
  return async (context) => {
    if (context.params.provider) {
      const instance = await context.service.get(context.id);
      if (instance.demo) return context;
      if (
        !instance.status.match(
          /draft|running|failed|timeout|pending-terminate|pending-remove/
        )
      ) {
        throw new Error("The instance is unstable for this action");
      }
    }
    return context;
  };
};
