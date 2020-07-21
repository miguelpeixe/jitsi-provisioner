const { authenticate } = require("@feathersjs/authentication").hooks;
const {
  hashPassword,
  protect,
} = require("@feathersjs/authentication-local").hooks;

const demoBlock = async (context) => {
  if (context.app.get("demo") && context.params.provider) {
    throw new Error("Demo mode does not allow this");
  }
};

module.exports = {
  before: {
    all: [],
    find: [authenticate("jwt")],
    get: [authenticate("jwt")],
    create: [hashPassword("password"), demoBlock, authenticate("jwt")],
    update: [hashPassword("password"), authenticate("jwt")],
    patch: [hashPassword("password"), authenticate("jwt")],
    remove: [authenticate("jwt"), demoBlock],
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
