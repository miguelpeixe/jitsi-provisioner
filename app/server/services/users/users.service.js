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

  const demoUsers = await service.find({ query: { demo: true } });

  if (demoUsers.length) {
    for (const user of demoUsers) {
      await service.remove(user._id);
    }
  }

  if (app.get("demo")) {
    logger.info("Creating demo users");
    await service.create({
      _id: "tkNzG1CgFfoWBOtM",
      username: "admin",
      password: "admin",
      role: "admin",
      demo: true,
    });
    await service.create({
      _id: "PSLm6VYTUrLXCrHb",
      username: "user",
      password: "user",
      role: "user",
      demo: true,
    });
  }
};
