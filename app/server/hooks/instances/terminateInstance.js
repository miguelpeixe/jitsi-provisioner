const path = require("path");
const logger = require("../../logger");
const { exec, sleep } = require("../../utils");
const { getParsedVars } = require("./utils");

module.exports = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;

    const data = await service.get(context.id);

    const DEMO = data.demo;

    const instancePath = path.join(data.path, "instance");

    if (!DEMO) {
      let instanceTarget = "default";
      if (data.ami) {
        instanceTarget = "from_ami";
      }
      try {
        await app.terraformExec(`terraform destroy \
          -input=false \
          -auto-approve \
          -target=aws_key_pair.default \
          -target=aws_security_group.default \
          -target=aws_eip_association.${instanceTarget} \
          -target=aws_instance.${instanceTarget} \
          ${getParsedVars(data.terraform.vars)} \
          -state=${instancePath}/tfstate`);
        await exec(`rm -r ${instancePath}`);
      } catch (e) {
        logger.error(e);
      }
    }

    await service.patch(data._id, {
      provisionedAt: null,
      readyAt: null,
    });

    if (DEMO) {
      await sleep(1 * 1000);
    }

    return context;
  };
};
