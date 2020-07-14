const path = require("path");
const { set } = require("lodash");
const logger = require("../../logger");
const { exec, sleep } = require("../../utils");
const { getParsedVars, fail } = require("./utils");

module.exports = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    const DEMO = data.demo;

    const instancePath = path.join(data.path, "instance");
    await exec(`mkdir -p ${instancePath}`);

    if (!DEMO) {
      let patchData = {
        "terraform.vars.eip_instance_config": "default",
      };
      let instanceTarget = "default";
      if (data.ami) {
        instanceTarget = "from_ami";
        patchData["terraform.vars.eip_instance_config"] = "from_ami";
      }
      await service.patch(data._id, patchData);
      set(context.result, patchData);

      try {
        logger.info("Creating instance plan");
        await app.terraformExec(`terraform plan \
          -input=false \
          ${getParsedVars(data.terraform.vars)} \
          -target=aws_key_pair.default \
          -target=aws_security_group.default \
          -target=aws_eip_association.${instanceTarget} \
          -target=aws_instance.${instanceTarget} \
          -state=${instancePath}/tfstate \
          -out=${instancePath}/tfcreate`);

        logger.info("Provisioning instance");
        await app.terraformExec(`terraform apply \
          -input=false \
          -auto-approve \
          -state=${instancePath}/tfstate \
          "${instancePath}/tfcreate"`);
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
