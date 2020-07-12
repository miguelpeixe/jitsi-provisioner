const path = require("path");
const axios = require("axios");
const { processHooks } = require("@feathersjs/commons").hooks;
const { authenticate } = require("@feathersjs/authentication").hooks;
const parseDomain = require("parse-domain").parseDomain;

const logger = require("../../logger");
const { generateId, exec, readFile, sleep, dnsLookup } = require("../../utils");
const cloudflare = require("../../cloudflare");

const DEMO = parseInt(process.env.DEMO);

const updateStatus = async (service, id, status) => {
  return await service.patch(id, { status });
};

const fail = async (service, id, reason) => {
  await service.patch(id, { status: "failed" });
  throw new Error(reason);
};

const getPublicIp = (data) => {
  if (data.publicIp) {
    return data.publicIp;
  }
  if (data.terraform.state.terraform_version) {
    return data.terraform.state.resources.find(
      (resource) => resource.type == "aws_eip"
    ).instances[0].attributes.public_ip;
  }
  return false;
};

const processHostname = (options = {}) => {
  return async (context) => {
    const { data } = context;

    const app = context.app;
    const dataPath = app.get("dataPath");
    const domain = app.get("domain");

    const id = generateId();
    const hostnamesPath = path.join(dataPath, "hostnames", id);
    const hostname = data.hostname || `${id}.${domain}`;

    let name = `hostname-${id}`;
    const parsedHostname = parseDomain(hostname);
    if (parsedHostname.subDomains.length) {
      name = parsedHostname.subDomains.join(".");
    }

    context.data = {
      _id: id,
      name: name,
      hostname: hostname,
      status: "draft",
      createdAt: new Date(),
      region: data.region || "us-east-1",
      path: hostnamesPath,
    };

    context.data.terraform = {
      vars: {
        aws_region: context.data.region,
      },
      state: {},
    };

    logger.info(`Creating new Hostname: ${name}`);

    return context;
  };
};

const createPath = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "creating-directory");

    if (!DEMO) {
      await exec(`mkdir -p ${data.path}`);
    } else {
      await sleep(1 * 1000);
    }

    return context;
  };
};

const createPlan = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "creating-plan");

    if (!DEMO) {
      await app.terraformExec(`terraform plan \
        -input=false \
        -target=aws_eip.default \
        -state=${data.path}/terraform.tfstate \
        -var "aws_region=${data.region}" \
        -out=${data.path}/tfcreate`);
    } else {
      await sleep(1 * 1000);
    }

    return context;
  };
};

const createHostname = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "provisioning");

    if (!DEMO) {
      await app.terraformExec(`terraform apply \
              -input=false \
              -auto-approve \
              -state=${data.path}/terraform.tfstate \
              "${data.path}/tfcreate"`);
    } else {
      await sleep(1 * 1000);
    }

    await service.patch(data._id, {
      provisionedAt: new Date(),
    });

    return context;
  };
};

const fetchState = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "fetching-state");

    let publicIp;

    if (!DEMO) {
      const tfstate = await readFile(path.join(data.path, "terraform.tfstate"));

      await service.patch(data._id, {
        "terraform.state": JSON.parse(tfstate),
      });
      context.result.terraform.state = JSON.parse(tfstate);
    } else {
      await sleep(1 * 1000);
      publicIp = `100.0.0.${Math.floor(Math.random() * (255 - 1 + 1) + 1)}`;
    }

    if (publicIp) {
      service.patch(data._id, { publicIp });
      context.result.publicIp = publicIp;
    }

    return context;
  };
};

const setDNSRecord = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "setting-dns");

    const publicIp = getPublicIp(data);

    if (!DEMO) {
      if (!publicIp) {
        await fail(service, data._id, "Public IP not found");
      }
      await cloudflare.upsertRecord(data.hostname, publicIp);
    } else {
      await sleep(2 * 1000);
    }

    return context;
  };
};

const waitDNS = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "waiting-dns");

    if (!DEMO) {
      const publicIp = getPublicIp(data);
      if (!publicIp) {
        await fail(service, data._id, "Public IP not found");
      }

      const startTime = Date.now();
      const timeout = 5 * 60 * 1000; // 5 minutes before giving up

      await sleep(40 * 1000); // Sleep for 40 seconds before flooding dns lookups

      let error;
      let address;
      let attemptTime = Date.now();
      while (address != publicIp && startTime + timeout >= attemptTime) {
        try {
          const res = await dnsLookup(data.hostname);
          address = res.address;
        } catch (e) {
          address = false;
          error = e.code;
        } finally {
          await sleep(5 * 1000); // Wait 5 seconds before another lookup
          attemptTime = Date.now();
        }
      }

      if (address != data.publicIp) {
        await updateStatus(service, data._id, "timeout");
        throw new Error("Could not resolve hostname");
      }
    } else {
      await sleep(2 * 1000);
    }
  };
};

const finish = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "active");

    return context;
  };
};

const destroy = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;

    const data = await service.get(context.id);

    await updateStatus(service, context.id, "releasing-eip");

    if (!DEMO) {
      try {
        await app.terraformExec(`terraform destroy \
            -input=false \
            -auto-approve \
            -target=aws_eip.default \
            -var "aws_region=${data.region}" \
            -state=${data.path}/terraform.tfstate`);
        await updateStatus(service, context.id, "removing-dns-records");
        await cloudflare.deleteRecord(data.hostname);
      } catch (e) {
        logger.error(e);
      }
    }

    await updateStatus(service, context.id, "removing-files");
    await exec(`rm -r ${data.path}`);

    if (DEMO) {
      await sleep(1 * 1000);
    }

    await service.remove(context.id);

    return context;
  };
};

const handleCreate = (options = {}) => {
  return async (context) => {
    const hooks = [
      createPath(),
      createPlan(),
      createHostname(),
      fetchState(),
      setDNSRecord(),
      finish(),
    ];
    if (context.params.provider) {
      processHooks.call(this, hooks, context);
    } else {
      await processHooks.call(this, hooks, context);
    }
    return context;
  };
};

const handleRemove = (options = {}) => {
  return async (context) => {
    if (context.params.provider) {
      await updateStatus(context.service, context.id, "removing");
      context.result = await context.service.get(context.id);
      logger.info(`Terminating Hostname: ${context.result.name}`);
      processHooks.call(this, [destroy()], context);
    }
    return context;
  };
};

const checkStability = (options = {}) => {
  return async (context) => {
    if (context.params.provider) {
      if (DEMO) return context;
      const instance = await context.service.get(context.id);
      if (!instance.status.match(/draft|active|failed|timeout/)) {
        throw new Error("Can't remove unstable Hostname");
      }
    }
    return context;
  };
};

const handleCreateError = (options = {}) => {
  return async (context) => {
    console.error(context.error);
  };
};

const handleRemoveError = (options = {}) => {
  return async (context) => {
    console.error(context.error);
  };
};

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [],
    get: [],
    create: [processHostname()],
    update: [],
    patch: [],
    remove: [checkStability(), handleRemove()],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [handleCreate()],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [handleCreateError()],
    update: [],
    patch: [],
    remove: [handleRemoveError()],
  },
};
