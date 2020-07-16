module.exports = (info = "") => {
  return async (context) => {
    await context.service.patch(context.id || context.result._id, { info });
    return context;
  };
};
