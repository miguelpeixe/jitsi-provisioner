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

const getParsedVars = (instance) => {
  const vars = instance.terraform.vars;
  return Object.keys(vars)
    .map((key) => `-var "${key}=${vars[key]}"`)
    .join(" ");
};

const checkLimit = (options = {}) => {
  return async (context) => {
    const max = parseInt(process.env.MAX_INSTANCES);
    if (!max) return context;
    const instances = await context.service.find({});
    if (instances.length >= max)
      throw new Error("Maximum number of instances reached");
    return context;
  };
};

const getPublicIp = (data) => {
  if (data.publicIp) {
    return data.publicIp;
  }
  if (data.terraform.state.terraform_version) {
    return data.terraform.state.resources.find(
      (resource) => resource.type == "aws_instance"
    ).instances[0].attributes.public_ip;
  }
  return false;
};

const processInstance = (options = {}) => {
  return async (context) => {
    const { data } = context;

    const app = context.app;
    const dataPath = app.get("dataPath");
    const domain = app.get("domain");

    const id = generateId();
    const instancePath = path.join(dataPath, "instances", id);
    const name = `server-${id}`;
    const hostname = data.hostname || `${name}.${domain}`;

    context.data = {
      _id: id,
      name: name,
      hostname: hostname,
      status: "draft",
      createdAt: new Date(),
      region: data.region || "us-east-1",
      type: data.type || "t3.large",
      path: instancePath,
      key: {
        path: path.join(instancePath, "key.pem"),
        name: `jitsi-${name}`,
      },
      terraform: {
        state: {},
        vars: {},
      },
    };

    context.data.terraform.vars = {
      name: `jitsi-${name}`,
      aws_region: context.data.region,
      instance_type: context.data.type,
      ssh_key_name: context.data.key.name,
      ssh_pubkey_path: `${context.data.key.path}.pub`,
      hostname: context.data.hostname,
      security_group_name: `jitsi-${context.data.name}`,
    };

    logger.info(`Creating new instance: ${name}`);

    return context;
  };
};

const validateData = (options = {}) => {
  return async (context) => {
    const { data } = context;

    // Ensure unique ID
    const idInstances = await context.service.find({
      query: { _id: data._id },
    });
    if (idInstances.length) {
      throw new Error("Duplicate ID");
    }

    // Ensure unique hostname
    const hostnameInstances = await context.service.find({
      query: { hostname: data.hostname },
    });
    if (hostnameInstances.length) {
      throw new Error("Hostname already in use");
    }

    // Validate hostname
    const domain = parseDomain(data.hostname);
    if (domain.type == "INVALID" || (domain.errors && domain.errors.length)) {
      throw new Error("Invalid hostname");
    }

    // AWS instance availability
    const awsInstance = await context.app.service("aws").get(data.type);
    if (!awsInstance) {
      throw new Error("AWS instance not found");
    }
    if (!awsInstance.pricing[data.region]) {
      throw new Error("AWS instance not available in the selected region");
    }

    return context;
  };
};

const verifyCloudFlare = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "veriyfing-dns");

    if (!DEMO) {
      const zone = await cloudflare.getZone(data.hostname);
      if (!zone) {
        await fail(
          service,
          data._id,
          "Could not connect to zone in CloudFlare"
        );
      }
    } else {
      await sleep(1 * 1000);
    }

    return context;
  };
};

const createPath = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "creating-directory");

    await exec(`mkdir -p ${data.path}`);

    return context;
  };
};

const createSSHKeys = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "creating-ssh-keys");

    await exec(`ssh-keygen -t rsa -b 2048 -N "" -m PEM -f ${data.key.path} && \
      chmod 400 ${data.key.path}`);

    return context;
  };
};

const findAMI = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "finding-ami");

    const amis = await app
      .service("amis")
      .find({ query: { region: data.region, status: "active" } });

    if (amis.length) {
      const ami = amis[0];
      let amiId = false;
      if (!DEMO) {
        try {
          amiId = ami.terraform.state.resources[0].instances[0].attributes.id;
        } catch (e) {
          logger.warn(`Could not find AMI state`, {
            instance: data._id,
            ami: ami._id,
          });
        }
      } else {
        amiId = "ami-123456789";
      }
      if (amiId) {
        const patch = {
          ami: ami._id,
          "terraform.vars.ami_id": amiId,
        };
        await service.patch(data._id, patch);
        context.result.ami = ami._id;
        context.result.terraform.vars.ami_id = amiId;
      }
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
      let instanceTarget = "default";
      if (data.ami) {
        instanceTarget = "from_ami";
      }
      try {
        await app.terraformExec(`terraform plan \
          -input=false \
          ${getParsedVars(data)} \
          -target=aws_key_pair.default \
          -target=aws_security_group.default \
          -target=aws_instance.${instanceTarget} \
          -state=${data.path}/terraform.tfstate \
          -out=${data.path}/tfcreate`);
      } catch (e) {
        await fail(service, data._id, e);
      }
    } else {
      await sleep(1 * 1000);
    }

    return context;
  };
};

const createInstance = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "provisioning");

    if (!DEMO) {
      try {
        await app.terraformExec(`terraform apply \
              -input=false \
              -auto-approve \
              -state=${data.path}/terraform.tfstate \
              "${data.path}/tfcreate"`);
      } catch (e) {
        await fail(service, data._id, e);
      }
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

    const publicIp = getPublicIp(data);

    if (!DEMO) {
      if (!publicIp) {
        await fail(service, data._id, "Public IP not found");
      }

      const startTime = Date.now();
      const timeout = 5 * 60 * 1000; // 5 minutes before giving up

      await sleep(30 * 1000); // Sleep for 30 seconds before flooding dns lookups

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

      if (address != publicIp) {
        await updateStatus(service, data._id, "timeout");
        throw new Error("Could not resolve hostname");
      }
    } else {
      await sleep(2 * 1000);
    }
  };
};

const waitApp = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;
    await updateStatus(service, data._id, "finishing-installation");

    let online;
    if (!DEMO) {
      const startTime = Date.now();
      const timeout = 3 * 60 * 1000; // 3 minutes before giving up

      let error;
      let attemptTime = Date.now();
      while (!online && startTime + timeout >= attemptTime) {
        try {
          const res = await axios.get(`https://${data.hostname}`);
          online = res.status;
        } catch (e) {
          online = false;
          error = e.code;
        } finally {
          if (!online) {
            await sleep(2 * 1000); // Wait 2 seconds before another fetch
            attemptTime = Date.now();
          }
        }
      }
    } else {
      await sleep(1 * 1000);
      online = 200;
    }

    if (!online) {
      await updateStatus(service, data._id, "timeout");
    } else {
      await updateStatus(service, data._id, "running");
      await service.patch(data._id, { readyAt: new Date() });
    }

    return context;
  };
};

const destroy = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;

    const data = await service.get(context.id);

    await updateStatus(service, context.id, "terminating-server");

    if (!DEMO) {
      try {
        await app.terraformExec(`terraform destroy \
            -input=false \
            -auto-approve \
            -target=aws_key_pair.default \
            -target=aws_security_group.default \
            -target=aws_instance.default \
            ${getParsedVars(data)} \
            -state=${data.path}/terraform.tfstate`);
      } catch (e) {
        logger.error(e);
      }
    }

    await updateStatus(service, context.id, "removing-files");
    await exec(`rm -r ${data.path}`);

    if (!DEMO) {
      await updateStatus(service, context.id, "removing-dns-records");
      try {
        await cloudflare.deleteRecord(data.hostname);
      } catch (e) {
        logger.error(e);
      }
    }

    if (DEMO) {
      await sleep(1 * 1000);
    }

    await service.remove(context.id);

    return context;
  };
};

const handleCreate = (options = {}) => {
  return async (context) => {
    processHooks.call(
      this,
      [
        verifyCloudFlare(),
        createPath(),
        createSSHKeys(),
        findAMI(),
        createPlan(),
        createInstance(),
        fetchState(),
        setDNSRecord(),
        waitDNS(),
        waitApp(),
      ],
      context
    );
    return context;
  };
};

const handleRemove = (options = {}) => {
  return async (context) => {
    if (context.params.provider) {
      await updateStatus(context.service, context.id, "removing");
      context.result = await context.service.get(context.id);
      logger.info(`Terminating instance: ${context.result.name}`);
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
      if (!instance.status.match(/draft|running|failed|timeout/)) {
        throw new Error("Can't remove unstable instance");
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
    create: [checkLimit(), processInstance(), validateData()],
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
