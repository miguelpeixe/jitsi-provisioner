const path = require("path");
const axios = require("axios");
const { processHooks } = require("@feathersjs/commons").hooks;
const { authenticate } = require("@feathersjs/authentication").hooks;
const { restrictToRole } = require("../../hooks");

const logger = require("../../logger");
const {
  generateId,
  exec,
  readFile,
  pathExists,
  sleep,
} = require("../../utils");

const DEMO = parseInt(process.env.DEMO);

const updateStatus = async (service, id, status) => {
  return await service.patch(id, { status });
};

const fail = async (service, id, reason) => {
  await service.patch(id, { status: "failed" });
  throw new Error(reason);
};

const getParsedVars = (vars) => {
  return Object.keys(vars)
    .map((key) => `-var "${key}=${vars[key]}"`)
    .join(" ");
};

const processAMI = (options = {}) => {
  return async (context) => {
    const { data } = context;

    const app = context.app;
    const service = context.service;
    const dataPath = app.get("dataPath");
    const domain = app.get("domain");

    const id = generateId();
    const amiPath = path.join(dataPath, "amis", id);

    let name = `ami-${id}`;

    if (!data.region) {
      throw new Error("Region is required");
    }

    const regionAMIs = await service.find({ query: { region: data.region } });
    if (regionAMIs.length) {
      throw new Error("There's already an AMI for this region");
    }

    context.data = {
      _id: id,
      name: name,
      status: "draft",
      createdAt: new Date(),
      region: data.region,
      path: amiPath,
    };

    context.data.terraform = {
      vars: {
        aws_region: context.data.region,
        ami_name: context.data.name,
      },
      state: {},
    };

    // Check for active AMIs for copying instead of creating
    const activeAMIs = await service.find({
      query: { status: "active" },
    });
    if (activeAMIs.length) {
      const sourceAMI = activeAMIs[0];
      let sourceId;
      if (!DEMO) {
        sourceId =
          sourceAMI.terraform.state.resources[0].instances[0].attributes.id;
      } else {
        sourceId = "ami-123456789";
      }

      context.data.sourceAMI = sourceAMI._id;
      context.data.terraform.vars.source_ami_id = sourceId;
      context.data.terraform.vars.source_ami_region = sourceAMI.region;
    } else {
      context.data.instance = {
        path: path.join(amiPath, "instance"),
      };
      context.data.terraform.instance = {
        vars: {},
        state: {},
      };
    }

    logger.info(`Creating new AMI: ${name}`);

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
    if (!data.sourceAMI) {
      await exec(`mkdir -p ${data.path}/instance`);
    }

    return context;
  };
};

const createInstance = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    // Skip if it has a source AMI
    if (data.sourceAMI) return context;

    await updateStatus(service, data._id, "creating-instance");

    const instance = data.instance;

    const vars = {
      aws_region: data.region,
      name: data.name,
    };

    await service.patch(data._id, {
      "terraform.instance.vars": vars,
    });
    context.result.terraform.instance.vars = vars;

    if (!DEMO) {
      try {
        await app.terraformExec(`terraform plan \
          -input=false \
          -target=aws_instance.for_ami \
          -state=${instance.path}/terraform.tfstate \
          ${getParsedVars(vars)} \
          -out=${instance.path}/tfcreate`);

        await app.terraformExec(`terraform apply \
          -input=false \
          -auto-approve \
          -state=${instance.path}/terraform.tfstate \
          "${instance.path}/tfcreate"`);

        const tfstate = await readFile(
          path.join(instance.path, "terraform.tfstate")
        );

        const instanceId = JSON.parse(tfstate).resources.find(
          (resource) => resource.type == "aws_instance"
        ).instances[0].attributes.id;

        await service.patch(data._id, {
          "terraform.instance.state": JSON.parse(tfstate),
          "terraform.vars.ami_instance_id": instanceId,
        });
        context.result.terraform.vars.ami_instance_id = instanceId;
        context.result.terraform.instance.state = JSON.parse(tfstate);
      } catch (e) {
        await fail(service, data._id, e);
      }
      await updateStatus(service, data._id, "installing");
      // Sleep for 3 minutes for cloud-init to finish (temporary fix)
      await sleep(3 * 60 * 1000);
    } else {
      await sleep(1 * 1000);
    }
  };
};

const createPlan = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "creating-plan");

    let target;
    if (data.sourceAMI) {
      target = "aws_ami_copy.default";
    } else {
      target = "aws_ami_from_instance.default";
    }

    if (!DEMO) {
      try {
        await app.terraformExec(`terraform plan \
          -input=false \
          -target=${target} \
          -state=${data.path}/terraform.tfstate \
          ${getParsedVars(data.terraform.vars)} \
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

const createAMI = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    await updateStatus(service, data._id, "creating-ami");

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

    if (!DEMO) {
      const tfstate = await readFile(path.join(data.path, "terraform.tfstate"));

      await service.patch(data._id, {
        "terraform.state": JSON.parse(tfstate),
      });
      context.result.terraform.state = JSON.parse(tfstate);
    } else {
      await sleep(1 * 1000);
    }

    return context;
  };
};

const destroyInstance = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    // Skip if it has a source AMI
    if (data.sourceAMI) return context;

    await updateStatus(service, data._id, "destroying-instance");

    if (!DEMO) {
      try {
        await app.terraformExec(`terraform destroy \
          -input=false \
          -auto-approve \
          -target=aws_instance.for_ami \
          ${getParsedVars(data.terraform.instance.vars)} \
          -state=${data.instance.path}/terraform.tfstate`);
      } catch (e) {
        logger.warn(e);
      }
      await exec(`rm -r ${data.instance.path}`);
      await service.patch(data._id, {
        "terraform.instance": {},
      });
      context.result.terraform.instance = {};
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

    await updateStatus(service, context.id, "destroying-ami");

    if (!DEMO) {
      try {
        if (data.instance) {
          const instanceExists = await pathExists(data.instance.path);
          if (instanceExists) {
            await updateStatus(service, context.id, "removing-instance");
            await app.terraformExec(`terraform destroy \
              -input=false \
              -auto-approve \
              -target=aws_instance.for_ami \
              ${getParsedVars(data.terraform.instance.vars)} \
              -state=${data.instance.path}/terraform.tfstate`);
            await exec(`rm -r ${data.instance.path}`);
          }
        }
        await app.terraformExec(`terraform destroy \
          -input=false \
          -auto-approve \
          -target=aws_ami_from_instance.default \
          ${getParsedVars(data.terraform.vars)} \
          -state=${data.path}/terraform.tfstate`);
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
    processHooks.call(
      this,
      [
        createPath(),
        createInstance(),
        createPlan(),
        createAMI(),
        fetchState(),
        destroyInstance(),
        finish(),
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
      logger.info(`Destroying AMI: ${context.result.name}`);
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
      if (!instance.status.match(/draft|active|failed/)) {
        throw new Error("Can't remove unstable AMI");
      }
    }
    return context;
  };
};

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [],
    get: [],
    create: [restrictToRole("admin"), processAMI()],
    update: [restrictToRole("admin")],
    patch: [restrictToRole("admin")],
    remove: [restrictToRole("admin"), checkStability(), handleRemove()],
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
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
