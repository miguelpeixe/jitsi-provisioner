const { authenticate } = require("@feathersjs/authentication").hooks;
const {
  hashPassword,
  protect,
} = require("@feathersjs/authentication-local").hooks;
const { restrictToRole } = require("../../hooks");
const { disallow } = require("feathers-hooks-common");

const demoBlock = async (context) => {
  // if (context.app.get("demo") && context.params.provider) {
  //   throw new Error("Demo mode does not allow this");
  // }
};

module.exports = {
  before: {
    all: [],
    find: [authenticate("jwt"), restrictToRole("admin")],
    get: [authenticate("jwt")],
    create: [
      hashPassword("password"),
      demoBlock,
      authenticate("jwt"),
      restrictToRole("admin"),
    ],
    update: [disallow("external")],
    patch: [
      hashPassword("password"),
      demoBlock,
      authenticate("jwt"),
      restrictToRole("admin"),
    ],
    remove: [demoBlock, authenticate("jwt"), restrictToRole("admin")],
  },

  after: {
    all: [protect("password")],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
