module.exports = (options = {}) => {
  return async (context) => {
    const { service } = context;
    if (context.params.provider && service.schema) {
      await service.schema.validateAsync(context.data);
    }
    return context;
  };
};
