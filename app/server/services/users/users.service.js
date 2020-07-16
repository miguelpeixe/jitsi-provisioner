const nedbService = require("feathers-nedb");
const NeDB = require("nedb");
const path = require("path");

const logger = require("../../logger");
const hooks = require("./users.hooks");

module.exports = async (app) => {
  const Model = new NeDB({
    filename: path.join(app.get("dbPath"), "users.db"),
    autoload: true,
  });

  app.use("/users", nedbService({ Model }));

  const service = app.service("users");

  service.hooks(hooks);

  const demoUser = await service.find({ query: { role: "demo" } });

  if (demoUser.length) {
    for (const user of demoUser) {
      await service.remove(user._id);
    }
  }

  if (app.get("demo")) {
    logger.info("Creating demo user");
    await service.create({
      _id: "tkNzG1CgFfoWBOtM",
      username: "admin",
      password: "admin",
      role: "demo",
    });
  }
};
