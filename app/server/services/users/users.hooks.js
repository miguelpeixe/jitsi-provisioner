const { authenticate } = require("@feathersjs/authentication").hooks;
const {
  hashPassword,
  protect,
} = require("@feathersjs/authentication-local").hooks;
const { restrictToRole } = require("../../hooks");
const { disallow } = require("feathers-hooks-common");

const validateCreate = (options = {}) => {
  return async (context) => {
    // Require password
    if (!context.data.username) {
      throw new Error("Username is required");
    }
    // Protect usernames
    if (context.params.provider && context.data.username.match(/admin|user/)) {
      throw new Error("Username not allowed");
    }
    // Require password
    if (!context.data.password) {
      throw new Error("Password is required");
    }
    // Unique username
    const username = await context.service.find({
      query: { username: context.data.username },
    });
    if (username.length) {
      throw new Error("Username already taken");
    }
    // Default role
    context.data.role = context.data.role || "user";
    return context;
  };
};

const demoBlock = async (context) => {
  if (context.app.get("demo") && context.params.provider) {
    throw new Error("Demo mode does not allow this");
  }
};

module.exports = {
  before: {
    all: [],
    find: [authenticate("jwt"), restrictToRole("admin")],
    get: [authenticate("jwt")],
    create: [
      validateCreate(),
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
