const path = require("path");
const axios = require("axios");
const { processHooks } = require("@feathersjs/commons").hooks;
const { authenticate } = require("@feathersjs/authentication").hooks;
const { disallow } = require("feathers-hooks-common");

const logger = require("../../logger");

const { wait, updateStatus, updateInfo, pushHistory } = require("../../hooks");

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
  downloadInstance,
  storeCertificate,
  finishInstall,
  terminateEIP,
  terminateInstance,
  removeFiles,
  removeDNSRecord,
} = require("../../hooks/instances");

const utils = require("../../hooks/instances/utils");

const provisionHooks = [
  updateStatus("provisioning"),
  updateInfo("verifying-dns"),
  verifyCloudflare(),
  updateInfo("finding-ami"),
  findAMI(),
  updateInfo("setting-dns"),
  setDNSRecord(),
  updateInfo("provisioning-instance"),
  provisionInstance(),
  pushHistory("provisioned"),
  updateStatus("running"),
  updateInfo("waiting-dns"),
  waitDNS(),
  updateInfo("installing"),
  waitApp(),
  updateStatus("available"),
  updateInfo("storing-certicate"),
  wait(5000),
  storeCertificate(),
  updateInfo(),
  async (context) => {
    await context.service.patch(context.id || context.result._id, {
      readyAt: new Date(),
    });
  },
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
      updateStatus("provisioning"),
      updateInfo("creating-directory"),
      createPath(),
      updateInfo("creating-keys"),
      createSSHKeys(),
      updateInfo("provisioning-eip"),
      provisionEIP(),
      updateStatus("standby"),
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
    if (context.params.provider) {
      processHooks.call(this, hooks, context);
    } else {
      await processHooks.call(this, hooks, context);
    }
    context.result = await context.service.get(context.id);
    return context;
  };
};

const handleTermination = (options = {}) => {
  return async (context) => {
    if (context.params.instanceAction != "terminate") return context;

    const data = context.result;
    logger.info(`Terminating instance: ${data.name}`);

    const hooks = [
      updateStatus("terminating"),
      updateInfo("storing-certicate"),
      storeCertificate(),
      updateInfo("downloading"),
      downloadInstance(),
      updateInfo("terminating"),
      terminateInstance(),
      updateInfo(),
      pushHistory("standby"),
      updateStatus("terminated"),
    ];
    // Async call when request not internal
    if (context.params.provider) {
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
      updateInfo("releasing-eip"),
      terminateEIP(),
      updateInfo("removing-dns"),
      removeDNSRecord(),
      updateInfo("removing-files"),
      removeFiles(),
      pushHistory("destroyed"),
      async (context) => {
        await context.service.remove(context.id);
      },
    ];
    // Async call when request not internal
    if (context.params.provider) {
      processHooks.call(this, hooks, context);
    } else {
      await processHooks.call(this, hooks, context);
    }
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
