const logger = require("../logger");

module.exports = (status = "", region = "", resources = []) => {
  return async (context) => {
    if (!status) {
      return context;
    }
    const app = context.app;
    const historyService = app.service("history");
    const data = context.result;
    region = region || data.region;
    if (!resources || !resources.length) {
      switch (status) {
        case "standby":
          resources = ["eip"];
          break;
        case "provisioned":
          resources = [data.type];
          break;
      }
    }
    const history = {
      date: new Date(),
      status,
      region,
      resources,
    };

    try {
      // Create history if not found
      const historyDoc = await historyService.find({
        query: { _id: data._id },
      });
      if (!historyDoc.length) {
        await historyService.create({ _id: data._id });
      }

      // Patch history
      await historyService.patch(data._id, {
        $set: {
          type: context.path,
        },
        $push: { history },
      });
      await context.service.patch(data._id, {
        $push: { history },
      });
    } catch (e) {
      logger.error(e);
    }
    return context;
  };
};
