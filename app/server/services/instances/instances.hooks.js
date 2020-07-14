const path = require("path");
const axios = require("axios");
const { processHooks } = require("@feathersjs/commons").hooks;
const { authenticate } = require("@feathersjs/authentication").hooks;
const { disallow } = require("feathers-hooks-common");

const logger = require("../../logger");

const { updateStatus, pushHistory } = require("../../hooks");

const {
  checkLimit,
  processInstance,
  validateData,
  checkStability,
} = require("../../hooks/instances");

// Async hooks used by `handleCreate` and `handleRemove`
const {
  verifyCloudflare,
  createPath,
  createSSHKeys,
  findAMI,
  provisionEIP,
  provisionInstance,
  setDNSRecord,
  waitDNS,
  waitApp,
  storeCertificate,
  finishInstall,
  terminateEIP,
  terminateInstance,
  removeFiles,
  removeDNSRecord,
} = require("../../hooks/instances");

const utils = require("../../hooks/instances/utils");

const provisionHooks = [
  updateStatus("verifying-dns"),
  verifyCloudflare(),
  updateStatus("finding-ami"),
  findAMI(),
  updateStatus("setting-dns"),
  setDNSRecord(),
  updateStatus("provisioning-instance"),
  provisionInstance(),
  pushHistory("provisioned"),
  updateStatus("waiting-dns"),
  waitDNS(),
  updateStatus("waiting-app"),
  waitApp(),
  updateStatus("storing-certificate"),
  storeCertificate(),
  async (context) => {
    await context.service.patch(context.id || context.result._id, {
      readyAt: new Date(),
    });
  },
  updateStatus("running"),
];

const validatePatch = (options = {}) => {
  return async (context) => {
    if (context.params.provider) {
      context.data = {};
    }
    return context;
  };
};

const handleAction = (options = {}) => {
  return async (context) => {
    const { action } = context.data;
    if (action) {
      switch (action) {
        case "terminate":
        case "provision":
        case "remove":
          context.params.instanceAction = action;
          context.data = { status: `pending-${action}` };
          break;
        default:
          throw new Error("Action not available");
      }
    }
    return context;
  };
};

const handleCreate = (options = {}) => {
  return async (context) => {
    const data = context.result;

    let hooks = [
      updateStatus("creating-directory"),
      createPath(),
      updateStatus("creating-keys"),
      createSSHKeys(),
      updateStatus("provisioning-eip"),
      provisionEIP(),
      pushHistory("standby"),
    ];
    hooks = hooks.concat(provisionHooks);

    logger.info(`Creating instance: ${data.name}`);

    // Async call when request not internal
    if (context.params.provider) {
      processHooks.call(this, hooks, context);
    } else {
      await processHooks.call(this, hooks, context);
    }
    context.result = await context.service.get(data._id);
    return context;
  };
};

const handleProvision = (options = {}) => {
  return async (context) => {
    if (context.params.instanceAction != "provision") return context;

    const data = context.result;
    let hooks = provisionHooks;

    logger.info(`Provisioning instance: ${data.name}`);

    // Async call when request not internal
    if (context.provider) {
      processHooks.call(this, hooks, context);
    } else {
      await processHooks.call(this, hooks, context);
    }
    context.result = await context.service.get(context.id);
    return context;
  };
};

const handleRemove = (options = {}) => {
  return async (context) => {
    if (context.params.instanceAction != "remove") return context;

    context.result = await context.service.get(context.id);
    logger.info(`Removing instance: ${context.result.name}`);

    const hooks = [
      updateStatus("releasing-eip"),
      terminateEIP(),
      updateStatus("removing-dns"),
      removeDNSRecord(),
      updateStatus("removing-files"),
      removeFiles(),
      pushHistory("destroyed"),
      async (context) => {
        await context.service.remove(context.id);
      },
    ];
    // Async call when request not internal
    if (context.provider) {
      processHooks.call(this, hooks, context);
    } else {
      await processHooks.call(this, hooks, context);
    }
    return context;
  };
};

const handleTermination = (options = {}) => {
  return async (context) => {
    if (context.params.instanceAction != "terminate") return context;

    const data = context.result;
    logger.info(`Terminating instance: ${data.name}`);

    const hooks = [
      updateStatus("terminating-instance"),
      terminateInstance(),
      pushHistory("standby"),
      updateStatus("terminated"),
    ];
    // Async call when request not internal
    if (context.provider) {
      processHooks.call(this, hooks, context);
    } else {
      await processHooks.call(this, hooks, context);
    }
    context.result = await context.service.get(context.id);
    return context;
  };
};

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [],
    get: [],
    create: [checkLimit(), processInstance(), validateData()],
    update: [disallow("external")],
    patch: [handleAction(), validatePatch()],
    remove: [disallow("external")],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [handleCreate()],
    update: [],
    patch: [handleTermination(), handleProvision(), handleRemove()],
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
