const path = require("path");
const axios = require("axios");
const { processHooks } = require("@feathersjs/commons").hooks;

const { generateId, exec, readFile, sleep } = require("../../utils");
const cloudflare = require("../../cloudflare");

const updateStatus = async (service, id, status) => {
  return await service.patch(id, { status });
};

const fail = async (service, id, reason) => {
  await service.patch(id, { status: "failed" });
  throw new Error(reason);
};

const getParsedVars = (instance) => {
  const vars = instance.terraformVars;
  return Object.keys(vars)
    .map((key) => `-var "${key}=${vars[key]}"`)
    .join(" ");
};

const processInstance = (options = {}) => {
  return async (context) => {
    const { data } = context;

    const app = context.app;
    const dataPath = app.get("dataPath");
    const domain = app.get("domain");

    const id = generateId();
    const instancePath = path.join(dataPath, `instance-${id}`);
    const serverName = `server-${id}`;

    context.data = {
      _id: id,
      status: "draft",
      createdAt: new Date(),
      region: data.region || "sa-east-1",
      type: data.type || "t3.large",
      path: instancePath,
      serverName: serverName,
      key: {
        path: path.join(instancePath, "key.pem"),
        name: `jitsi-${serverName}`,
      },
      domain: `${serverName}.${domain}`,
    };

    context.data.terraformVars = {
      aws_region: context.data.region,
      instance_type: context.data.type,
      ssh_key_name: context.data.key.name,
      ssh_key_path: context.data.key.path,
      ssh_pubkey_path: `${context.data.key.path}.pub`,
      domain_name: context.data.domain,
      security_group_name: `jitsi-${context.data.serverName}`,
    };

    return context;
  };
};

const verifyCloudFlare = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "veriyfing-dns");

    const zone = await cloudflare.getZone(data.domain);

    if (!zone) {
      fail(service, data._id, "Could not connect to zone in CloudFlare");
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

const createPlan = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "creating-plan");

    await app.terraformExec(`terraform plan \
            -input=false \
            ${getParsedVars(data)} \
            -state=${data.path}/terraform.tfstate \
            -out=${data.path}/tfcreate`);

    return context;
  };
};

const createInstance = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "provisioning");

    await app.terraformExec(`terraform apply \
            -input=false \
            -auto-approve \
            -state=${data.path}/terraform.tfstate \
            "${data.path}/tfcreate"`);

    return context;
  };
};

const fetchPublicIp = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "fetching-ip");

    const tfstate = await readFile(path.join(data.path, "terraform.tfstate"));

    const publicIp = JSON.parse(tfstate).resources.find(
      (resource) => resource.type == "aws_instance"
    ).instances[0].attributes.public_ip;

    if (publicIp) {
      service.patch(data._id, { publicIp });
      context.result.publicIp = publicIp;
    } else {
      fail(service, data._id, "Could not fetch public ip");
    }
  };
};

const setDNSRecord = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "setting-dns");

    if (!data.publicIp) {
      fail(service, data._id, "Public IP not found");
    }

    await cloudflare.upsertRecord(data.domain, data.publicIp);

    return context;
  };
};

const getApp = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;
    await updateStatus(service, data._id, "installing");

    await sleep(30 * 1000); // Sleep 30 seconds before flooding requests

    const startTime = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes before giving up

    let online;
    let error;
    let attemptTime = Date.now();
    while (!online && startTime + timeout >= attemptTime) {
      try {
        const res = await axios.get(`https://${data.domain}`);
        online = res.status;
      } catch (e) {
        online = false;
        error = e.code;
      } finally {
        if (!online) {
          await sleep(5 * 1000); // Sleep 5 seconds before another attempt
          attemptTime = Date.now();
        }
      }
    }

    if (!online) {
      await updateStatus(service, data._id, "timeout");
    } else {
      await updateStatus(service, data._id, "ready");
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

    try {
      await updateStatus(service, context.id, "terminating-server");
      await app.terraformExec(`terraform destroy \
          -input=false \
          -auto-approve \
          ${getParsedVars(data)} \
          -state=${data.path}/terraform.tfstate`);
      await updateStatus(service, context.id, "removing-files");
      await exec(`rm -r ${data.path}`);
      await updateStatus(service, context.id, "removing-dns-records");
      await cloudflare.deleteRecord(data.domain);
    } catch (e) {
      console.error(e);
    }

    await service.remove(context.id);

    return context;
  };
};

const handleCreate = (options = {}) => {
  return (context) => {
    processHooks.call(
      this,
      [
        verifyCloudFlare(),
        createPath(),
        createSSHKeys(),
        createPlan(),
        createInstance(),
        fetchPublicIp(),
        setDNSRecord(),
        getApp(),
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
      processHooks.call(this, [destroy()], context);
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
    all: [],
    find: [],
    get: [],
    create: [processInstance()],
    update: [],
    patch: [],
    remove: [handleRemove()],
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
