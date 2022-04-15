const nedbService = require("feathers-nedb");
const NeDB = require("nedb");
const path = require("path");
const { authenticate } = require("@feathersjs/authentication").hooks;
const { disallow } = require("feathers-hooks-common");

module.exports = async (app) => {
  const Model = new NeDB({
    filename: path.join(app.get("dbPath"), "containers.db"),
    autoload: true,
  });

  Model.ensureIndex({ fieldName: "containerId", unique: true });
  Model.ensureIndex({ fieldName: "instanceId", unique: false });

  app.use("/containers", nedbService({ Model }));

  const service = app.service("containers");

  service.upsert = async (data) => {
    const { containerId, instanceId } = data;
    const res = await service.find({
      query: {
        containerId,
        instanceId,
      },
    });
    if (res.length) {
      return service.patch(res[0]._id, data);
    }
    return service.create(data);
  };

  service.hooks({
    before: {
      all: [authenticate("jwt")],
      create: [disallow("external")],
      patch: [disallow("external")],
      update: [disallow("external")],
      remove: [disallow("external")],
    },
  });
};
